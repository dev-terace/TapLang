import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useChatRoomStore } from '@/chat/store/ChatRoom'

export const useUIStore = defineStore('ui', () => {
  const currentTab = ref('memo')
  const isChatRoomCreate = ref(false);
  const chatRoomMemberIds = ref<number[]>([])
  const roomName = ref<string>('');
  const conversationId = ref<String>('');
  const profileMenuFriendId = ref<number | null>(null)

  const changeTab = (tab: string) => {
    currentTab.value = tab
  }

  const changeChatRoomTab = (isCreate: boolean, memberIds: number[], name: string, currentTabVal: string) => {
    
    if(!currentTabVal)
    {
      currentTab.value = "chatRoom"
    }else{
      currentTab.value = currentTabVal
    }
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
    conversationId,
    profileMenuFriendId
  }
})