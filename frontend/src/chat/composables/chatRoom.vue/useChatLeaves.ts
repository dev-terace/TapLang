import type { Ref } from 'vue'

interface UseChatLeaveOptions {
  conversationId: Ref<string | null>
  onLeave?: () => Promise<void> | void
  onSuccess?: () => void
}

export function useChatLeave({
  conversationId,
  onLeave,
  onSuccess
}: UseChatLeaveOptions) {

  const leaveChatRoom = async () => {
    if (!conversationId.value) {
      return
    }

    const confirmed = window.confirm(
      '정말 이 채팅방에서 나가시겠습니까?'
    )

    if (!confirmed) {
      return
    }

    try {
      if (onLeave) {
        await onLeave()
      }

      onSuccess?.()

    } catch (error) {
      console.error(
        '채팅방 나가기 실패:',
        error
      )

      window.alert(
        '채팅방 나가기에 실패했습니다.'
      )
    }
  }

  return {
    leaveChatRoom
  }
}