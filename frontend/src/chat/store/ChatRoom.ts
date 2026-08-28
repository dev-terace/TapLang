import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ChatRoomApi } from '../api/chatRoom.api'

export interface Message {
  id: string
  conversationId: string
  senderId: number
  senderName: string
  content: string
  attachments?: ChatRoomApi.Attachment[] | null
  createdAt: string
  flag: string
}

export const useChatRoomStore = defineStore(
  'chatRoom',
  () => {
    const conversationId = ref<string | null>(null)
    const messages = ref<Message[]>([])
    const messageCache = ref<Map<string, string>>(new Map())

    // ✅ 추가: 과거 메시지가 더 있는지 여부 (방별로 관리하면 더 정확하지만, 우선 단순하게)
    const hasMoreMessages = ref(true)
    const isLoadingMoreMessages = ref(false)

    const setConversationId = (id: string | null) => {
      conversationId.value = id
      messages.value = []
      hasMoreMessages.value = true   // ✅ 방 바뀌면 초기화
    }

    const addMessage = (message: Message) => {
      if (
        conversationId.value &&
        message.conversationId !== conversationId.value
      ) {
        return
      }

      const exists = messages.value.some(m => m.id === message.id)
      if (exists) return

      messages.value.push(message)
      addMessageCache(message)
    }

    // ✅ 추가: 과거 메시지를 맨 앞에 붙이기 (중복 제거 + 정렬 유지)
    const prependMessages = (olderMessages: Message[]) => {
      const existingIds = new Set(messages.value.map(m => m.id))
      const newOnes = olderMessages.filter(m => !existingIds.has(m.id))

      // olderMessages는 이미 과거→현재 순으로 정렬되어 들어온다고 가정
      messages.value = [...newOnes, ...messages.value]
    }

    const addMessageCache = (message: Message) => {
      const oldDate = messageCache.value.get(message.conversationId)
      if (
        !oldDate ||
        new Date(message.createdAt).getTime() > new Date(oldDate).getTime()
      ) {
        messageCache.value.set(message.conversationId, message.createdAt)
      }
    }

    const setMessages = (newMessages: Message[]) => {
      const currentId = conversationId.value
      if (!currentId) {
        messages.value = []
        return
      }
      messages.value = newMessages.filter(
        message => message.conversationId === currentId
      )
      messages.value.forEach(addMessageCache)
    }

    const hasMessageCache = (id: string) => messageCache.value.has(id)

    const createChat = ChatRoomApi.createChat
    const createMessage = ChatRoomApi.createMessage
    const getChatMessages = ChatRoomApi.getChatMessages
    const existsConversation = ChatRoomApi.existsConversation
    const getGroupChatMembers = ChatRoomApi.getGroupChatMembers
    const getConversationInfo = ChatRoomApi.getConversationInfo
    const joinConversation = ChatRoomApi.joinConversation
    const leaveConversation = ChatRoomApi.leaveConversation

    return {
      conversationId,
      messages,
      messageCache,
      hasMoreMessages,        // ✅
      isLoadingMoreMessages,  // ✅

      setConversationId,
      addMessage,
      prependMessages,        // ✅
      setMessages,
      addMessageCache,
      hasMessageCache,

      createChat,
      createMessage,
      getChatMessages,
      existsConversation,
      getGroupChatMembers,
      getConversationInfo,
      joinConversation,
      leaveConversation
    }
  }
)