import { useChatRoomStore } from '@/chat/store/ChatRoom'

export function useChatMessages() {
  const chatRoomStore = useChatRoomStore()

  /**
   * 최초 진입 시 메시지 로드 (최신 메시지부터)
   */
  const loadMessages = async (id: string) => {
    if (!id) return

    try {
      const { data, hasMore } =
        await chatRoomStore.getChatMessages(id)

      // 서버는 최신순(desc)으로 내려주므로, 화면 표시는 과거→최신 순이 되도록 뒤집음
      const sorted = [...data].reverse()

      sorted.forEach(msg => {
        chatRoomStore.addMessage(msg)
      })

      chatRoomStore.hasMoreMessages = hasMore ?? (data.length === 10)
    } catch (error) {
      console.error(
        '메시지 조회 실패:',
        error
      )
    }
  }

  /**
   * ✅ 추가: 위로 스크롤 시 과거 메시지 더 불러오기
   */
  const loadOlderMessages = async (): Promise<number> => {
    const id = chatRoomStore.conversationId
    if (!id) return 0
    if (chatRoomStore.isLoadingMoreMessages) return 0
    if (!chatRoomStore.hasMoreMessages) return 0

    const oldestMessage = chatRoomStore.messages[0]
    if (!oldestMessage) return 0

    chatRoomStore.isLoadingMoreMessages = true

    try {
      const { data, hasMore } =
        await chatRoomStore.getChatMessages(id, oldestMessage.createdAt)

      const sorted = [...data].reverse()

      chatRoomStore.prependMessages(sorted)
      chatRoomStore.hasMoreMessages = hasMore ?? (data.length === 10)

      return sorted.length
    } catch (error) {
      console.error(
        '과거 메시지 조회 실패:',
        error
      )
      return 0
    } finally {
      chatRoomStore.isLoadingMoreMessages = false
    }
  }

  return {
    loadMessages,
    loadOlderMessages   // ✅ 추가
  }
}