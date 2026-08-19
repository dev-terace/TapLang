import { computed, nextTick, ref } from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useChatStore } from '@/chat/store/Chat'
import { useChatMessages } from './useChatMessages'


import type { CustomRoom } from '../stores/CustomChatStore'

interface UseCustomChatRoomOptions {
  scrollToBottom: () => void
}

export function useCustomChatRoom(
  options: UseCustomChatRoomOptions
) {
  const uiStore = useUIStore()
  const chatRoomStore = useChatRoomStore()
  const chatStore = useChatStore()

  // ⭐ 이게 빠진 것
  const { loadMessages } = useChatMessages()

  const isProcessing = ref(false)

  const conversationId = computed(
    () => chatRoomStore.conversationId
  )

  // =========================================================
  // CUSTOM 방 입장
  // =========================================================

  const enterCustomRoom = async (
    room: CustomRoom,
    password?: string
  ) => {
    if (isProcessing.value) {
      return false
    }

    isProcessing.value = true

    try {
      // 공개방
      if (!room.isSecret) {
        return await openCustomRoom(room)
      }

      // 비밀방
      if (!password) {
        return false
      }

      // TODO
      // 실제 비밀번호 검증 API

      return await openCustomRoom(room)

    } catch (error) {
      console.error(
        'CUSTOM 채팅방 입장 실패:',
        error
      )

      return false

    } finally {
      isProcessing.value = false
    }
  }

  // =========================================================
  // CUSTOM 방 열기
  // =========================================================

  const openCustomRoom = async (
    room: CustomRoom
  ) => {

    const id = room.id

    // 방 존재 확인
    const exists =
      await chatRoomStore.existsConversation(id)

    if (!exists) {
      console.warn(
        '[CUSTOM ROOM] 존재하지 않는 방:',
        id
      )

      return false
    }

    // 현재 방 설정
    chatRoomStore.setConversationId(id)

    uiStore.conversationId = id
    uiStore.roomName = room.title
    uiStore.currentTab = 'customChatRoom'
    uiStore.isChatRoomCreate = false

    // ⭐ 공통 메시지 조회
    await loadMessages(id)

    // 읽음 처리
    await chatStore.readConversation(id)

    await chatStore.getMyConversations()

    // 스크롤
    await nextTick()

    requestAnimationFrame(() => {
      options.scrollToBottom()
    })

    return true
  }

  return {
    conversationId,
    isProcessing,
    enterCustomRoom,
    openCustomRoom
  }
}