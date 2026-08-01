import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUIStore = defineStore('ui', () => {
  const currentTab = ref('memo')
  const isChatRoomCreate = ref(false);
  const chatRoomMemberIds = ref<number[]>([])

  const changeTab = (tab: string) => {
    currentTab.value = tab
  }

  const changeChatRoomTab = (isCreate: boolean, memberIds: number[]) => {
    currentTab.value = "chatRoom"
    isChatRoomCreate.value = isCreate
    chatRoomMemberIds.value = memberIds
  }

  return {
    currentTab,
    changeTab,
    changeChatRoomTab,
    chatRoomMemberIds
  }
})