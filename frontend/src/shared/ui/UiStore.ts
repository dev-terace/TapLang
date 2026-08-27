import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../auth/api.config'
export const useUIStore = defineStore('ui', () => {

  const currentTab = ref('chat')

  const isChatRoomCreate = ref(false)

  const chatRoomMemberIds = ref<number[]>([])

  const roomName = ref('')

  // ⭐ 중요
  const conversationId = ref<string | null>(null)

  const profileMenuFriendId = ref<number | null>(null)
  const attendanceCheckedDate = ref<string | null>(null)


const getToday = (): string => {
  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const checkAttendance = async (): Promise<boolean> => {
  const today = getToday()

  // 오늘 이미 체크했다면 API 요청하지 않음
  if (attendanceCheckedDate.value === today) {
    return false
  }

  try {
    await api.post('/api/profile/attendence')

    attendanceCheckedDate.value = today

    return true

  } catch (error) {
    console.error('출석 체크 실패:', error)
    return false
  }
}

  const changeTab = (tab: string) => {
    currentTab.value = tab
    void checkAttendance()
  }


  const changeChatRoomTab = (
    isCreate: boolean,
    memberIds: number[],
    name: string,
    currentTabVal: string
  ) => {

    void checkAttendance()
    currentTab.value =
      currentTabVal || 'chatRoom'

    isChatRoomCreate.value =
      isCreate

    chatRoomMemberIds.value =
      [...memberIds]

    roomName.value =
      name
  }


  return {
    currentTab,
    changeTab,
    changeChatRoomTab,

    chatRoomMemberIds,
    isChatRoomCreate,
    roomName,
    conversationId,

    profileMenuFriendId
  }
})