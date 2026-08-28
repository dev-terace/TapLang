import { defineStore } from 'pinia'
import { ChatApi } from '../api/chat.api'
import { ref } from 'vue'

export interface ConversationResponse {
  data: Conversation[]
  nextCursor: NextCursor | null
}

export interface Conversation {
  conversationId: string
  type: 'DIRECT' | 'GROUP' | 'CUSTOM'
  name: string | null
  members: ConversationMember[]
  owner?: ConversationMember | null
  activeMemberCount?: number
  unreadCount: number
  lastMessage: LastMessage | null
  lastMessageId: string | null
  lastMessageAt: string | null
  notification?: boolean

}

export interface ConversationMember {
  userId: number
  role: 'OWNER' | 'MEMBER',
  flag: string
}

export interface LastMessage {
  id: string
  senderId: number
  content: string
  attachments: unknown | null
  createdAt: string
}

export interface NextCursor {
  conversationId: string
  lastMessageAt: string
}

export const useChatStore = defineStore('chat', () => {
  // ✅ data와 nextCursor를 분리해서 관리 (컴포넌트가 .data로 접근하는 것과 타입 일치)
  const conversations = ref<Conversation[]>([])
  const nextCursor = ref<NextCursor | null>(null)
  const isLoadingMore = ref(false)
  const hasMore = ref(false)

  // 최초 로드 (or 새로고침) — 목록을 덮어씀
  const getMyConversations = async (): Promise<void> => {
    const result: ConversationResponse = await ChatApi.getMyConversations()

    conversations.value = result.data
    nextCursor.value = result.nextCursor
    hasMore.value = !!result.nextCursor

    console.log('getMyConversations : ', conversations.value)
  }

  // ✅ 다음 페이지 로드 — 기존 목록에 이어붙임
  const loadMoreConversations = async (): Promise<void> => {
    if (!nextCursor.value || isLoadingMore.value) return

    isLoadingMore.value = true
    try {
      const result: ConversationResponse = await ChatApi.getMyConversations(
        nextCursor.value
      )

      conversations.value = [...conversations.value, ...result.data]
      nextCursor.value = result.nextCursor
      hasMore.value = !!result.nextCursor

      console.log('loadMoreConversations : ', result.data.length, '개 추가')
    } catch (error) {
      console.error('loadMoreConversations error:', error)
    } finally {
      isLoadingMore.value = false
    }
  }

  const getConvUnreadCounts = ChatApi.getConversationUnreadCounts
  const readConversation = ChatApi.readConversation

  return {
    conversations,
    nextCursor,
    hasMore,
    isLoadingMore,
    getConvUnreadCounts,
    getMyConversations,
    loadMoreConversations,
    readConversation,
  }
})