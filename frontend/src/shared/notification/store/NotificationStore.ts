import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatNotification {
  id: string
  conversationId: string
  conversationName?: string 
  senderId?: number
  senderName?: string
  content?: string
}

export const useNotificationStore = defineStore(
  'notification',
  () => {

    const notifications = ref<ChatNotification[]>([])

    // 알림 추가
    const addNotification = (
      notification: ChatNotification
    ) => {
      // 같은 메시지 알림 중복 방지
      const exists = notifications.value.some(
        item => item.id === notification.id
      )

      if (exists) return

      notifications.value.push(notification)

      // 너무 많이 쌓이지 않도록 최대 5개
      if (notifications.value.length > 5) {
        notifications.value.shift()
      }
    }

    // 특정 알림 삭제
    const removeNotification = (
      id: string
    ) => {
      notifications.value =
        notifications.value.filter(
          notification =>
            notification.id !== id
        )
    }

    // 전체 알림 삭제
    const clearNotifications = () => {
      notifications.value = []
    }

    return {
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }
  }
)