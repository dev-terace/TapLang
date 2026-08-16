import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ChatRoomApi } from '../api/chatRoom.api'

export interface Message {
  id: string
  conversationId: string
  senderId: number
  senderName?: string
  content: string
  attachments?: ChatRoomApi.Attachment[] | null
  createdAt: string
  flag: string
}

export const useChatRoomStore = defineStore(
  'chatRoom',
  () => {

    /*
     * 현재 열려 있는 채팅방
     */
    const conversationId =
      ref<string | null>(null)

    /*
     * 현재 채팅방의 메시지만 저장
     */
    const messages =
      ref<Message[]>([])

    /*
     * 방별 마지막 메시지 캐시
     */
    const messageCache =
      ref<Map<string, string>>(new Map())


    /**
     * 현재 채팅방 변경
     */
    const setConversationId = (
      id: string | null
    ) => {

      conversationId.value = id

      /*
       * 다른 방으로 이동하면
       * 현재 메시지 초기화
       */
      messages.value = []
    }


    /**
     * 메시지 추가
     */
    const addMessage = (
      message: Message
    ) => {

      /*
       * 현재 방 메시지가 아니면 무시
       */
      if (
        conversationId.value &&
        message.conversationId !==
          conversationId.value
      ) {
        return
      }

      /*
       * 중복 메시지 방지
       */
      const exists =
        messages.value.some(
          m => m.id === message.id
        )

      if (exists) {
        return
      }

      messages.value.push(message)

      addMessageCache(message)
    }


    /**
     * 메시지 캐시 추가
     */
    const addMessageCache = (
      message: Message
    ) => {

      const oldDate =
        messageCache.value.get(
          message.conversationId
        )

      if (
        !oldDate ||
        new Date(
          message.createdAt
        ).getTime() >
        new Date(oldDate).getTime()
      ) {

        messageCache.value.set(
          message.conversationId,
          message.createdAt
        )
      }
    }


    /**
     * 현재 방 메시지 전체 교체
     */
    const setMessages = (
      newMessages: Message[]
    ) => {

      const currentId =
        conversationId.value

      if (!currentId) {
        messages.value = []
        return
      }

      messages.value =
        newMessages.filter(
          message =>
            message.conversationId ===
            currentId
        )

      messages.value.forEach(
        addMessageCache
      )
    }


    /**
     * 메시지 캐시 존재 여부
     */
    const hasMessageCache = (
      id: string
    ) => {

      return messageCache.value.has(id)
    }


    /*
     * API
     */
    const createChat =
      ChatRoomApi.createChat

    const createMessage =
      ChatRoomApi.createMessage

    const getChatMessages =
      ChatRoomApi.getChatMessages

    const existsConversation =
      ChatRoomApi.existsConversation

    const joinConversation =
      ChatRoomApi.joinConversation

    const getGroupChatMembers =
      ChatRoomApi.getGroupChatMembers

    const getConversationInfo =
      ChatRoomApi.getConversationInfo


    return {
      conversationId,
      messages,
      messageCache,

      setConversationId,

      addMessage,
      setMessages,
      addMessageCache,
      hasMessageCache,

      createChat,
      createMessage,
      getChatMessages,
      existsConversation,
      joinConversation,
      getGroupChatMembers,
      getConversationInfo
    }
  }
)