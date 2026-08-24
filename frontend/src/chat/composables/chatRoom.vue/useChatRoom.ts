import { ref, nextTick, watch } from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useChatStore } from '@/chat/store/Chat'

interface UseChatRoomOptions {
  scrollToBottom: () => void
}

export function useChatRoom(options: UseChatRoomOptions) {
  const uiStore = useUIStore()
  const chatRoomStore = useChatRoomStore()
  const chatStore = useChatStore()

  const isProcessing = ref(false)

  /**
   * 메시지 조회 (최초 진입 시 — 최신 메시지부터)
   */
  const loadMessages = async (id: string) => {
    console.log('[LOAD MESSAGES]', id)
    if (!id) return

    try {
      const { data, hasMore } = await chatRoomStore.getChatMessages(id)

      // 서버는 최신순(desc)으로 내려줌 → 화면 표시는 과거→최신이어야 하므로 reverse
      const sorted = [...data].reverse()

      sorted.forEach(msg => {
        chatRoomStore.addMessage(msg)
      })

      chatRoomStore.hasMoreMessages = hasMore ?? (data.length === 30)
    } catch (error) {
      console.error('메시지 조회 실패:', error)
    }
  }

  /**
   * ✅ 추가: 과거 메시지 더 불러오기 (커서 = 현재 가진 메시지 중 가장 오래된 것의 createdAt)
   */
  const loadOlderMessages = async () => {
    const id = chatRoomStore.conversationId
    if (!id) return
    if (chatRoomStore.isLoadingMoreMessages) return
    if (!chatRoomStore.hasMoreMessages) return

    const oldestMessage = chatRoomStore.messages[0]
    if (!oldestMessage) return

    chatRoomStore.isLoadingMoreMessages = true

    try {
      const { data, hasMore } = await chatRoomStore.getChatMessages(
        id,
        oldestMessage.createdAt   // ← 커서
      )

      // 서버는 최신순(desc)으로 내려줌 → 과거→최신 순으로 뒤집어서 prepend
      const sorted = [...data].reverse()

      chatRoomStore.prependMessages(sorted)
      chatRoomStore.hasMoreMessages = hasMore ?? (data.length === 30)

      return sorted.length
    } catch (error) {
      console.error('과거 메시지 조회 실패:', error)
      return 0
    } finally {
      chatRoomStore.isLoadingMoreMessages = false
    }
  }

  /**
   * 새로운 채팅방 생성 (첫 메시지 전송 시 호출)
   */
  const createRoom = async () => {
    const memberIds = [...uiStore.chatRoomMemberIds]
    if (memberIds.length === 0) return null

    try {
      const chatType =
        uiStore.currentTab === 'inviteChatRoom'
          ? 'GROUP'
          : memberIds.length > 1
            ? 'GROUP'
            : 'DIRECT'


          console.log('createChat request', {
      memberIds,
      chatType,
      name: chatType === 'GROUP' ? uiStore.roomName : null,
            
    })      
      const conversationId = await chatRoomStore.createChat({
        memberIds,
        chatType,
        name: chatType === 'GROUP' ? uiStore.roomName : null,
        message: ''
      })

      chatRoomStore.setConversationId(conversationId)
      uiStore.conversationId = conversationId
      uiStore.isChatRoomCreate = false

      if (chatType === 'GROUP') {
        await chatRoomStore.joinConversation(conversationId, memberIds)
      }

      await loadMessages(conversationId)
      await chatStore.getMyConversations()

      await nextTick()
      requestAnimationFrame(() => {
        options.scrollToBottom()
      })

      return conversationId
    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      return null
    }
  }

  /**
   * 채팅방 진입 감지
   */
  watch(
    () => ({
      conversationId: uiStore.conversationId,
      memberIds: [...uiStore.chatRoomMemberIds],
      currentTab: uiStore.currentTab
    }),

    async ({ conversationId, memberIds, currentTab }) => {
      // 채팅방 화면이 아니면 무시
      if (currentTab !== 'chatRoom' && currentTab !== 'inviteChatRoom') {
        return
      }

      if (isProcessing.value) return
      isProcessing.value = true

      try {
        let targetId = conversationId

        // 1:1 채팅 진입 시 conversationId가 없으면 내 대화 목록에서 기존 방 탐색
        if (!targetId && currentTab === 'chatRoom' && memberIds.length === 1) {
          const targetMemberId = memberIds[0]

          await chatStore.getMyConversations()
          const existingRoom = chatStore.myConversations?.find(
            (c: any) => c.chatType === 'DIRECT' && c.targetUserId === targetMemberId
          )

          if (existingRoom) {
            targetId = existingRoom.id
            uiStore.conversationId = targetId
            uiStore.isChatRoomCreate = false
          }
        }

        // 기존 방이 없는 완전히 새로운 채팅방일 경우 메시지 비우고 대기
        if (!targetId) {
          chatRoomStore.setConversationId(null)
          return
        }

        // 스토어 방 번호 설정 (이전 메시지 내역 비우기 실행됨)
        chatRoomStore.setConversationId(targetId)

        // 방 존재 여부 확인
        const exists = await chatRoomStore.existsConversation(targetId)
        if (!exists) {
          console.warn('[CHAT ROOM] 존재하지 않는 방:', targetId)
          chatRoomStore.setConversationId(null)
          return
        }

        if (currentTab === 'inviteChatRoom') {
          await chatRoomStore.joinConversation(targetId, memberIds)
        }

        // 진입 즉시 메시지 로드 및 읽음 처리
        await loadMessages(targetId)
        await chatStore.readConversation(targetId)
        await chatStore.getMyConversations()

        await nextTick()
        requestAnimationFrame(() => {
          options.scrollToBottom()
        })
      } catch (error) {
        console.error('채팅방 진입 실패:', error)
      } finally {
        isProcessing.value = false
      }
    },
    { immediate: true }
  )

  return {
    createRoom,
    loadMessages,
    loadOlderMessages
  }
}