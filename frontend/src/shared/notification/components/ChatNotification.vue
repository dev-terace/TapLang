<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { MessageCircle } from 'lucide-vue-next'

import { useNotificationStore } from '@/shared/notification/store/NotificationStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useOpenConversation } from '@/chat/composables/useOpenConversationRoom'

import notificationSound from '@/assets/audio/chatNotification.mp3'
import { useCustomChatStore } from '@/custom_chat/stores/CustomChatStore'
// Store & Composable
const notificationStore = useNotificationStore()
const chatRoomStore = useChatRoomStore()
const { openConversation } = useOpenConversation()
const customChatStore = useCustomChatStore()

// 상태
const isOpening = ref(false)

// 현재 동작 중인 타이머 관리 Map (Notification ID -> Timer)
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

// ==================================================
// 알림음 재생
// ==================================================
const playNotificationSound = async () => {
  try {
    // 매번 새로운 Audio 인스턴스를 생성하여 재생 충돌 방지
    const audio = new Audio(notificationSound)
    audio.volume = 0.5
    await audio.play()
    console.log('🔊 알림음 재생 성공')
  } catch (error) {
    // 사용자가 아직 페이지와 상호작용하지 않아 차단된 경우 등 처리
    console.warn('🔇 알림음 재생 실패 (브라우저 자동재생 정책 제한 등):', error)
  }
}

// ==================================================
// 알림 상태 감지 및 10초 타이머 자동 처리
// ==================================================
watch(
  () => notificationStore.notifications,
  (notifications) => {
    const currentIds = new Set(notifications.map((n) => n.id))

    // 1. 이미 스토어에서 사라진 알림의 타이머 정리
    activeTimers.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer)
        activeTimers.delete(id)
      }
    })

    // 2. 새로 들어온 알림 처리
    notifications.forEach((notification) => {
      // 아직 타이머가 안 걸린 '새 알림'인 경우만 실행
      if (!activeTimers.has(notification.id)) {
        // 소리 재생
        playNotificationSound()

        // 10초 후 알림 제거 타이머 설정
        const timer = setTimeout(() => {
          console.log('⏰ 10초 경과 → 알림 제거:', notification.id)
          notificationStore.removeNotification(notification.id)
          activeTimers.delete(notification.id)
        }, 10000)

        activeTimers.set(notification.id, timer)
      }
    })
  },
  { deep: true, immediate: true }
)

// ==================================================
// 채팅방 열기
// ==================================================
const openChat = async (notification: {
  id: string
  conversationId: string,
  conversationName?: string
  senderName?: string
  content?: string
}) => {
  if (isOpening.value) return

  try {
    isOpening.value = true

    if (!notification.conversationId) {
      console.error('❌ conversationId가 없습니다.', notification)
      return
    }

    const response = await chatRoomStore.getConversationInfo(
      notification.conversationId
    )
    const conversation = response?.conversation ?? response

    if (!conversation) {
      console.error('❌ 채팅방 정보를 찾을 수 없습니다.')
      return
    }


    if (conversation.type === 'CUSTOM') {

      customChatStore.setCurrentConversation(
        conversation
      )
    }

    // 채팅방 열기
    openConversation(conversation)

    // 알림 제거 (스토어에서 삭제되면 watch가 감지하여 타이머도 자동으로 정리됨)
    notificationStore.removeNotification(notification.id)
  } catch (error) {
    console.error('❌ 알림 채팅방 이동 실패:', error)
  } finally {
    isOpening.value = false
  }
}

// ==================================================
// 컴포넌트 언마운트 시 모든 타이머 정리
// ==================================================
onBeforeUnmount(() => {
  activeTimers.forEach((timer) => clearTimeout(timer))
  activeTimers.clear()
})

</script>
<template>

  <Teleport to="body">

    <div
      class="
        fixed
        top-4
        right-4
        z-[300]

        w-[calc(100vw-2rem)]
        max-w-sm

        flex
        flex-col
        gap-3

        pointer-events-none
      "
    >

      <TransitionGroup
        name="chat-notification"
        tag="div"
        class="flex flex-col gap-3"
      >

        <button
          v-for="
            notification
            in notificationStore.notifications
          "

          :key="notification.id"

          type="button"

          :disabled="isOpening"

          @click="
            openChat(notification)
          "

          class="
            pointer-events-auto

            w-full

            text-left

            bg-[#e6e2db]
            text-[#2d2b28]

            border-2
            border-[#2d2b28]

            shadow-[5px_5px_0px_0px_#121315]

            p-3

            transition-all
            duration-150

            hover:-translate-x-1
            hover:-translate-y-1

            hover:shadow-[7px_7px_0px_0px_#121315]

            active:translate-x-[3px]
            active:translate-y-[3px]

            active:shadow-none

            disabled:opacity-60
            disabled:cursor-wait
          "
        >

          <div
            class="
              flex
              items-start
              gap-3
            "
          >

            <!-- 아이콘 -->

            <div
              class="
                w-9
                h-9

                shrink-0

                flex
                items-center
                justify-center

                bg-[#2d2b28]
                text-white

                border-2
                border-[#2d2b28]
              "
            >

              <MessageCircle
                class="
                  w-5
                  h-5
                  stroke-[2.5]
                "
              />

            </div>


                 <!-- 내용 -->       

                <div
                class="
                    min-w-0
                    flex-1
                "
                >

                <!-- 채팅방 이름 -->

                <div
                    class="
                    text-[10px]
                    font-bold
                    text-neutral-500
                    truncate
                    mb-0.5
                    "
                >
                    {{
                    notification.conversationName
                    ?? '채팅'
                    }}
                </div>


                <!-- 보낸 사람 -->

                <div
                    class="
                    flex
                    items-center
                    justify-between
                    gap-2
                    "
                >

                    <span
                    class="
                        text-xs
                        font-bold
                        truncate
                    "
                    >
                    {{
                        notification.senderName
                        ?? '새 메시지'
                    }}
                    </span>


                    <span
                    class="
                        text-[9px]
                        font-bold
                        text-neutral-500
                        shrink-0
                    "
                    >
                    NEW
                    </span>

                </div>


                <!-- 메시지 -->

                <p
                    class="
                    mt-1

                    text-[11px]
                    font-medium

                    text-[#4a4742]

                    line-clamp-2
                    break-words
                    "
                >
                    {{
                    notification.content
                    ??
                    '새로운 메시지가 도착했습니다.'
                    }}
                </p>

                </div>

          </div>

        </button>

      </TransitionGroup>

    </div>

  </Teleport>

</template>


<style scoped>

.chat-notification-enter-active,
.chat-notification-leave-active {

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

}


.chat-notification-enter-from {

  opacity: 0;

  transform:
    translateX(30px);

}


.chat-notification-leave-to {

  opacity: 0;

  transform:
    translateX(30px);

}


.chat-notification-move {

  transition:
    transform 0.2s ease;

}

</style>