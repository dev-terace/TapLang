import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useChatRoomStore } from '@/chat/store/ChatRoom'

export const useUIStore = defineStore('ui', () => {
  const currentTab = ref('memo')
  const isChatRoomCreate = ref(false);
  const chatRoomMemberIds = ref<number[]>([])
  const roomName = ref<string>('');
  const conversationId = ref<String>('');
  const chatRoomStore = useChatRoomStore()

  const changeTab = (tab: string) => {
    currentTab.value = tab
  }

  const changeChatRoomTab = (isCreate: boolean, memberIds: number[], name: string) => {
    currentTab.value = "chatRoom"
    isChatRoomCreate.value = isCreate
    chatRoomMemberIds.value = memberIds
    roomName.value = name
    // chatRoomStore.conversationId = ''
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