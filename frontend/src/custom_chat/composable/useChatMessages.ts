import { useChatRoomStore } from '@/chat/store/ChatRoom'

export function useChatMessages() {
  const chatRoomStore = useChatRoomStore()

  const loadMessages = async (id: string) => {
    if (!id) return

    try {
      const { data } =
        await chatRoomStore.getChatMessages(id)

      data.reverse().forEach(msg => {
        chatRoomStore.addMessage(msg)
      })
    } catch (error) {
      console.error(
        '메시지 조회 실패:',
        error
      )
    }
  }

  return {
    loadMessages
  }
}