import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {

  const currentTab = ref('memo')

  const isChatRoomCreate = ref(false)

  const chatRoomMemberIds = ref<number[]>([])

  const roomName = ref('')

  // ⭐ 중요
  const conversationId = ref<string | null>(null)

  const profileMenuFriendId = ref<number | null>(null)


  const changeTab = (tab: string) => {
    currentTab.value = tab
  }


  const changeChatRoomTab = (
    isCreate: boolean,
    memberIds: number[],
    name: string,
    currentTabVal: string
  ) => {

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