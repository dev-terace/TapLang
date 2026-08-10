import { defineStore } from 'pinia'
import { computed, watch, ref } from 'vue'
import { useClerk, useAuth, useUser } from '@clerk/vue'
import api from '@/shared/auth/api.config'
import { useSocketRegister } from "../socket/socket.register";
import { setTokenGetter } from "@/shared/auth/auth.util";


interface UserInfo {
  id: number;
  name: string;
  flag: string;
  email: string;
  statusMsg: string;
}

export const useAuthStore = defineStore('auth', () => {
  const clerk = useClerk()
  const { isSignedIn, userId: clerkId, getToken } = useAuth()
  const { user } = useUser()

  setTokenGetter(() => getToken.value())


  const email = computed(() =>
    user.value?.primaryEmailAddress?.emailAddress ?? ''
  )

  const name = computed(() =>
    email.value ? email.value.split('@')[0] : ''
  )

  const isLoggedIn = computed(() => isSignedIn.value)

  const login = () => {
    clerk.value?.openSignIn()
  }

  const logout = async () => {
    await clerk.value?.signOut()
  }

  // 💡 [개선] isSignedIn과 user 객체 둘 다 로드되었을 때 안전하게 백엔드로 요청
  
  const userInfo = ref<UserInfo | null>(null);

  watch([isSignedIn, user], async ([signedIn, currentUser]) => {
    // 로그인 상태가 아니거나, 유저 프로필 정보가 아직 로드되지 않았다면 대기
    if (!signedIn || !currentUser) return
    
   
    const provider = 'clerk'
    

    try {
      const { data } = await api.post('/api/users', {
        provider,
        email: email.value, // 👈 1. .value 추가 (순환참조 에러 방지)
        name: name.value,   // 👈 1. .value 추가 (순환참조 에러 방지)
      }
     )
      userInfo.value = data.user
      const socketStore = useSocketRegister();
      socketStore.connect()

      socketStore.isOnlineUsersLoaded = true
      console.log('유저 백엔드 동기화 성공:', data.user.id)
      
    } catch (error) {
      console.error('유저 동기화 실패:', error)
    }
  })

  return {
    userInfo,
    isLoggedIn,
    login,
    logout
  }
})