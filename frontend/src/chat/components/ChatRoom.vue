<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue' // onMounted, onUnmounted 추가
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import { useAuthStore } from '@/shared/auth/AuthStore'
import ChatFeatureModal from './ChatFeatureModel.vue'
import { useChatStore } from '../store/Chat.js'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()
const chatStore = useChatStore()
const authStore = useAuthStore();

const ownId = computed(() => authStore.userInfo?.id);

// 메시지 입력 상태
const newMessage = ref('')

// ✨ 스크롤 제어를 위한 DOM Ref 추가
const messageContainer = ref<HTMLElement | null>(null)


// ✨ 더 견고한 스크롤 함수 (이중 nextTick + rAF)
const scrollToBottom = () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    })
  })
}

// ✨ 탭 진입 시에도 스크롤 (마운트 시점)
onMounted(() => {
  scrollToBottom()
})

// ✨ 이미지 등 늦게 로드되는 컨텐츠 대응: ResizeObserver로 높이 변화 감지
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (messageContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      scrollToBottom()
    })
    resizeObserver.observe(messageContainer.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

// ✨ 탭이 chatRoom으로 전환될 때도 스크롤
watch(
  () => uiStore.currentTab,
  (tab) => {
    if (tab === 'chatRoom') {
      scrollToBottom()
    }
  }
)

watch(
  () => uiStore.chatRoomMemberIds,
  async (memberIds) => {
    if (memberIds.length !== 1) return;

    // 이미 방이 있으면 생성하지 않음
    const conversationId = await chatRoomStore.createChat({
      memberIds,
      chatType: 'DIRECT',
      name: null,
      message: ""
    });

    await chatStore.readConversation(conversationId)

    if (chatRoomStore.conversationId == conversationId) {
      return
    }

    chatRoomStore.conversationId = conversationId;

    if (!chatRoomStore.hasMessageCache(chatRoomStore.conversationId)) {
      await loadMessages(conversationId);
      console.log("메시지 로드")
    }  
  },
  {
    deep: true,
    immediate: true
  }
);

const loadMessages = async (id: string) => {
  if (!id) return;

  try {
    const { data } = await chatRoomStore.getChatMessages(id);
    
    data.reverse().forEach((message) => {
      chatRoomStore.addMessage(message);
    });

  } catch (error) {
    console.error("메시지 조회 실패", error);
    chatRoomStore.messages = [];
  }
};

const sendMessage = async () => {
  const trimmedMessage = newMessage.value.trim()
  
  // 메시지가 없는 상태면 return
  if (!trimmedMessage) return
  const initialMessage = trimmedMessage || '안녕하세요!'

  const chatRoomMemberIds = uiStore.chatRoomMemberIds

  console.log("uistore is chat room create : ", uiStore.isChatRoomCreate)
  if (chatRoomStore.conversationId == null) {
    chatRoomStore.conversationId = await chatRoomStore.createChat({
      memberIds: chatRoomMemberIds,
      chatType: 'DIRECT',
      name: null,
      message: "" 
    })
  } else {
    await chatRoomStore.createMessage({
      conversationId: chatRoomStore.conversationId,
      content: initialMessage
    })
  }

  // 입력창 초기화
  newMessage.value = ''
  
  // ✨ 메시지 전송 후 최하단 스크롤
  scrollToBottom()
}

const filteredMessages = computed(() =>
  chatRoomStore.messages.filter(
    message => message.conversationId === chatRoomStore.conversationId
  )
);


const formatDate = (date: string | Date) => {
  const d = new Date(date)

  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

const isSameDate = (date1: string | Date, date2: string | Date) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}


// ✨ 메시지 목록이 갱신(추가/로드)될 때마다 최하단 스크롤
watch(
  () => filteredMessages.value,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chatRoom'"
    class="flex h-screen min-h-0 flex-col bg-[#dfdad1]"
  >
    <!-- 헤더 -->
    <div
      class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
    >
      <button 
        @click="uiStore.currentTab = 'chat'"
        class="text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
      >
        <span>&lt;</span> 뒤로
      </button>

      <span class="text-xs font-bold tracking-wider">
        {{uiStore.roomName}}
      </span>

      <button class="text-xs font-bold hover:text-white transition-colors">
        옵션
      </button>
    </div>

    <!-- 채팅 메시지 목록 영역 (✨ ref="messageContainer" 추가) -->
    <div
      ref="messageContainer"
      class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col"
    >
<div
  ref="messageContainer"
  class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col"
>
      <div
        v-for="(message, index) in filteredMessages"
        :key="message.id"
      >
        <!-- 날짜가 바뀌었으면 날짜 구분선 -->
        <div
          v-if="
            index === 0 ||
            !isSameDate(
              filteredMessages[index - 1].createdAt,
              message.createdAt
            )
          "
          class="flex justify-center my-3"
        >
          <span
            class="text-[10px] bg-[#c5bfb6] px-2 py-1
                  border-2 border-[#2d2b28]
                  font-bold text-[#2d2b28]"
          >
            {{ formatDate(message.createdAt) }}
          </span>
        </div>

        <!-- 메시지 -->
        <ChatRoomMessage
          :message="message"
          :own-id="ownId"
        />
      </div>
    </div>

      <!-- 날짜 구분선 -->
      <!-- <div class="flex justify-center my-2">
        <span class="text-[10px] bg-[#c5bfb6] px-2 py-1 border-2 border-[#2d2b28] font-bold text-[#2d2b28]">
          2026. 08. 01
        </span>
      </div> -->
    </div>

    <!-- 하단 입력창 영역 -->
    <div class="relative shrink-0 bg-[#c5bfb6] p-3 border-t-2 border-[#2d2b28]">
      <!-- 폼 영역 -->
      <div class="flex gap-2 items-center">
        
        <ChatFeatureModal @select="selectFeature"/>
    
        <!-- 텍스트 인풋 -->
        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          @keyup.enter="sendMessage"
          class="flex-1 bg-[#f4f1eb] text-xs p-2 border-2 border-[#2d2b28] text-[#2d2b28] 
                 placeholder-[#726e67] focus:outline-none focus:ring-0
                 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] h-9"
        />
        
        <!-- 전송 버튼 -->
        <button
          @click="sendMessage"
          class="bg-[#2d2b28] text-white text-xs font-bold px-4 h-9
                 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] 
                 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>