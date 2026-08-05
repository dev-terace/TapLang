import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUIStore = defineStore('ui', () => {
  const currentTab = ref('memo')
  const isChatRoomCreate = ref(false);
  const chatRoomMemberIds = ref<number[]>([])
  const roomName = ref<string>('');
  const conversationId = ref<String>('');

  const changeTab = (tab: string) => {
    currentTab.value = tab
  }

  const changeChatRoomTab = (isCreate: boolean, memberIds: number[], name: string) => {
    currentTab.value = "chatRoom"
    isChatRoomCreate.value = isCreate
    chatRoomMemberIds.value = memberIds
    roomName.value = name
  }

  return {
    currentTab,
    changeTab,
    changeChatRoomTab,
    chatRoomMemberIds,
    isChatRoomCreate,
    roomName,
    conversationId
  }
})