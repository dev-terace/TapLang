import { defineStore } from 'pinia'
import { computed, watch, ref, Ref } from 'vue'
import { useClerk, useAuth, useUser } from '@clerk/vue'
import api from '@/shared/auth/api.config'
import { useSocketRegister } from "../socket/socket.register"
import { setTokenGetter } from "@/shared/auth/auth.util"

interface UserInfo {
  id: number
  name: string
  flag: string
  email: string
  statusMsg: string
  showOnlineStatus: boolean
}

// 💡 기본값 객체 정의
const DEFAULT_USER_INFO: Omit<UserInfo, 'id'> = {
  name: '익명 사용자',
  flag: '🌐',
  email: '',
  statusMsg: '상태 메시지가 없습니다.',
  showOnlineStatus: true
}

export const useAuthStore = defineStore('auth', () => {
  const clerk = useClerk()
  const { isSignedIn, userId: clerkId, getToken } = useAuth()
  const { user } = useUser()

  setTokenGetter(() => getToken.value())

  const email = computed(() => user.value?.primaryEmailAddress?.emailAddress ?? '')
  const name = computed(() => (email.value ? email.value.split('@')[0] : '익명'))
  const isLoggedIn = computed(() => isSignedIn.value)

  const login = () => clerk.value?.openSignIn()
  const logout = async () => await clerk.value?.signOut()

  const userInfo = ref<UserInfo | null>(null)

  // 💡 Template 등에서 안전하게 사용할 수 있는 기본값 포함 Computed
const currentUserInfo = computed<UserInfo>(() => {
  return {
    id: userInfo.value?.id ?? 0,
    name: userInfo.value?.name || name.value || DEFAULT_USER_INFO.name,
    flag: userInfo.value?.flag || DEFAULT_USER_INFO.flag,
    email: userInfo.value?.email || email.value || DEFAULT_USER_INFO.email,
    statusMsg: userInfo.value?.statusMsg || DEFAULT_USER_INFO.statusMsg,
    showOnlineStatus: userInfo.value?.showOnlineStatus ?? DEFAULT_USER_INFO.showOnlineStatus,
  }
})


async function syncAndAssignUser(payload: { provider: string; email: string; name: string }) {
  const { data } = await api.post('/api/users', payload)

  // 스토어 내부의 userInfo ref를 직접 업데이트 (반응형 보장)
  userInfo.value = {
    id: data.user.id,
    name: data.user.name || payload.name || DEFAULT_USER_INFO.name,
    flag: data.user.flag || DEFAULT_USER_INFO.flag,
    email: data.user.email || payload.email || DEFAULT_USER_INFO.email,
    statusMsg: data.user.statusMsg || DEFAULT_USER_INFO.statusMsg,
    showOnlineStatus: data.user.showOnlineStatus ?? true,
  }
}

  watch([isSignedIn, user], async ([signedIn, currentUser]) => {
    if (!signedIn || !currentUser) return


    try {
      await syncAndAssignUser({
            provider: 'clerk',
            email: email.value,
            name: name.value,
          })

      const socketStore = useSocketRegister()
      socketStore.connect()
      socketStore.isOnlineUsersLoaded = true
    
    } catch (error) {
      console.error('유저 동기화 실패:', error)
    }
  })

  return {
    userInfo,
    currentUserInfo, // 👈 기본값이 보장된 안전한 계산된 속성 추가
    isLoggedIn,
    login,
    logout,
    syncAndAssignUser
  }
})