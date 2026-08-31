<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatStore } from '@/chat/store/Chat'
import { watch, computed, ref, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/shared/utils/DateUtils'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { storeToRefs } from 'pinia'
import { useChatRoomStore } from '../store/ChatRoom'
import { useChatNavigation } from '@/chat/composables/chatRoom.vue/useChatNavigation.js'
import { useInfiniteScroll } from '@/shared/ui/composables/useInfiniteScroll'

const { t } = useI18n()
const { openConversation } = useChatNavigation()

const uiStore = useUIStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const chatRoomStore = useChatRoomStore()
const { userInfo } = storeToRefs(authStore)

// ✅ 스토어가 이미 배열을 들고 있으므로 그대로 사용
const conversations = computed(() => chatStore.conversations)

watch(
  () => authStore.userInfo,
  async (userInfo) => {
    if (!userInfo) return
    await chatStore.getMyConversations()
  },
  { immediate: true }
)

watch(
  () => conversations.value,
  (newVal) => {
    console.log('채팅방 목록 데이터:', newVal)
    if (newVal.length > 0) {
      console.log('첫번째 방 unreadCount 값:', newVal[0].unreadCount)
    }
  },
  { deep: true }
)

// ✅ 스크롤 하단 감지 → 자동 더보기 (버튼 없이 무한 스크롤)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const { setup: setupObserver, teardown: teardownObserver } = useInfiniteScroll({
  container: scrollContainer,
  sentinel: loadMoreTrigger,
  hasMore: () => chatStore.hasMore,
  isLoading: () => chatStore.isLoadingMore,
  loadMore: () => chatStore.loadMoreConversations(),
  preserveScroll: false,
  debugLabel: 'chatList',
})

watch(
  () => uiStore.currentTab,
  (tab) => {
    if (tab === 'chat') {
      setupObserver()
    } else {
      teardownObserver()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chat'"
    class="flex h-full min-h-0 flex-col bg-[#dfdad1]"
  >
    <!-- 헤더 -->
    <div
      class="shrink-0 bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
    >
      <span class="text-xs font-bold tracking-wider">
        {{ t('chat.title') }}
      </span>

      <span class="text-[10px] text-[#726e67]">
        {{ t('chat.count', { count: conversations.length }) }}
      </span>
    </div>

    <!-- 채팅방 목록 (스크롤 컨테이너는 이거 하나뿐) -->
    <div ref="scrollContainer" class="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
      <div
        v-for="conversation in conversations"
        :key="conversation.conversationId"
        class="group flex items-center gap-3 p-2 bg-[#f4f1eb]
               hover:bg-[#2d2b28] hover:text-[#fbf9f5]
               border-2 border-[#2d2b28]
               shadow-[3px_3px_0px_0px_#2d2b28]
               cursor-pointer transition-all"
        @dblclick="openConversation(conversation)"
      >
        <!-- 프로필 -->
        <div class="w-10 h-10 shrink-0">
          <!-- 1:1 -->
          <div
            v-if="conversation.type === 'DIRECT'"
            class="w-full h-full bg-[#2d2b28] text-white
                   flex items-center justify-center
                   border-2 border-[#2d2b28] font-pixel text-lg"
          >
            <img
              :src="`https://flagcdn.com/w40/${conversation.members[0]?.flag}.png`"
              alt=""
              class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
            />
          </div>

          <!-- 그룹 -->
          <div
            v-else
            class="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full"
          >
            <div
              v-for="member in conversation.members.slice(0, 4)"
              :key="member.userId"
              class="bg-[#2d2b28] text-white
                     flex items-center justify-center
                     border border-[#2d2b28] text-[10px]"
            >
              <img
                :src="`https://flagcdn.com/w40/${member?.flag}.png`"
                alt=""
                class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
              />
            </div>
          </div>
        </div>

        <!-- 채팅 정보 -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-1 min-w-0">
              <span class="text-xs font-bold truncate">
                {{
                  conversation?.name
                    ?.split('|')
                    .find(v => v !== userInfo?.name)
                  ?? t('chat.directChat')
                }}
              </span>

              <span
                v-if="conversation.notification === false"
                class="shrink-0 text-[10px] opacity-70 group-hover:opacity-100"
                :title="t('chat.notificationsOff')"
              >
                🔕
              </span>
            </div>

            <span
              class="text-[10px] text-neutral-500
                     group-hover:text-neutral-300 shrink-0"
            >
              {{ formatTime(conversation.lastMessageAt) }}
            </span>
          </div>

          <div
            class="text-[10px] text-neutral-500
                   group-hover:text-neutral-300 truncate"
          >
            {{ conversation.lastMessage?.content ?? '' }}
          </div>
        </div>

        <!-- 안 읽은 메시지 -->
        <div
          v-if="conversation.unreadCount > 0"
          class="w-5 h-5 rounded-full bg-red-500 text-white
                 flex items-center justify-center
                 text-[10px] font-bold shrink-0"
        >
          {{
            conversation.unreadCount > 999
              ? '999+'
              : conversation.unreadCount
          }}
        </div>
      </div>

      <!-- 무한 스크롤 트리거 (버튼 없음, 로딩 중일 때만 텍스트 표시) -->
      <div ref="loadMoreTrigger" class="flex justify-center py-3">
        <span
          v-if="chatStore.isLoadingMore"
          class="text-[10px] text-[#726e67]"
        >
          {{ t('chat.loading') }}
        </span>
      </div>
    </div>
  </div>
</template>