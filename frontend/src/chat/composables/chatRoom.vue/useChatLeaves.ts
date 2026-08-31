import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n' // i18n 추가
import { ChatRoomApi } from '@/chat/api/chatRoom.api'
import { useChatStore } from '@/chat/store/Chat'

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
  const { t } = useI18n() // t 함수 가져오기
  const chatStore = useChatStore()

  const leaveChatRoom = async () => {
    if (!conversationId.value) {
      return
    }

    const confirmed = window.confirm(
      t('use-chat-leaves.confirmLeave')
    )

    if (!confirmed) {
      return
    }

    try {
      if (onLeave) {
        await onLeave()
      }

      await ChatRoomApi.leaveConversation(conversationId.value)
      await chatStore.getMyConversations()

      onSuccess?.()

    } catch (error) {
      console.error(
        t('use-chat-leaves.leaveFailedLog'),
        error
      )

      window.alert(
        t('use-chat-leaves.leaveFailedAlert')
      )
    }
  }

  return {
    leaveChatRoom
  }
}