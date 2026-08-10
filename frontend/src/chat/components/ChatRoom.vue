<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useChatStore } from '@/chat/store/Chat'
import { useAuthStore } from '@/shared/auth/AuthStore'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import ChatFeatureModal from './ChatFeatureModel.vue'
import { useChatScroll } from '@/chat/composables/useChatScroll'
import { formatDate, isSameDate } from '@/chat/composables/chatDate'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()
const chatStore = useChatStore()
const authStore = useAuthStore()

const ownId = computed(() => authStore.userInfo?.id)
const newMessage = ref('')

// [수정됨] 1:1 채팅과 그룹 채팅을 더 정확하게 구분하는 로직
const isGroupChat = computed(() => {
  // 1. 탭이 명시적으로 그룹 초대 탭인 경우
  if (uiStore.currentTab === 'inviteChatRoom') return true
  
  // 2. 선택된 멤버(나 제외)가 2명 이상이면 그룹 채팅으로 간주
  if (uiStore.chatRoomMemberIds && uiStore.chatRoomMemberIds.length > 1) return true
  
  // 3. 이미 생성된 방이라면 스토어의 chatType 등으로 구분 (스토어 구조에 맞춰 주석 해제)
  // const currentRoom = chatRoomStore.conversations?.find(c => c.id === chatRoomStore.conversationId)
  // if (currentRoom?.chatType === 'GROUP') return true
  
  return false
})

// DOM Ref & 스크롤 Composable 적용
const messageContainer = ref<HTMLElement | null>(null)
const filteredMessages = computed(() =>
  chatRoomStore.messages.filter(
    m => m.conversationId === chatRoomStore.conversationId
  )
)
const { scrollToBottom } = useChatScroll(messageContainer, () => filteredMessages.value)

// 대화 상대 모달 상태 (그룹 채팅 전용)
const isMembersModalOpen = ref(false)
const expandedMemberIndex = ref<number | null>(null)
const mockMembers = computed(() => [
  { name: authStore.userInfo?.name || '내 닉네임#123', status: '상태 메시지가 없습니다.', icon: '🇰🇷' },
  { name: 'j21813378#0', status: '상태 메시지가 없습니다.', icon: '🇰🇷' }
])

const toggleMember = (index: number) => {
  expandedMemberIndex.value = expandedMemberIndex.value === index ? null : index
}

// 통합 채팅방 생성 및 메시지 로드 워처
const isCreating = ref(false)

watch(
  () => [uiStore.chatRoomMemberIds, uiStore.currentTab] as const,
  async ([memberIds, currentTab]) => {
    if (!memberIds || memberIds.length === 0) return
    if (currentTab !== 'chatRoom' && currentTab !== 'inviteChatRoom') return
    if (isCreating.value) return

    try {
      isCreating.value = true

      let conversationId = uiStore.conversationId

      if (conversationId) {
        const exists = await chatRoomStore.existsConversation(conversationId)
        if (!exists) conversationId = null
      }

      if (!conversationId) {
        conversationId = await chatRoomStore.createChat({
          memberIds,
          chatType: isGroupChat.value ? 'GROUP' : 'DIRECT',
          name: isGroupChat.value ? uiStore.roomName : null,
          message: ''
        })
        uiStore.conversationId = conversationId
      }

      await chatStore.readConversation(conversationId)
      await chatStore.getMyConversations()
      chatRoomStore.conversationId = conversationId

      // 그룹 채팅일 경우에만 멤버 조인 로직 실행
      if (isGroupChat.value) {
        await chatRoomStore.joinConversation(conversationId, memberIds)
      }

      if (!chatRoomStore.hasMessageCache(conversationId)) {
        await loadMessages(conversationId)
      }
    } catch (error) {
      console.error('채팅방 진입 실패:', error)
    } finally {
      isCreating.value = false
    }
  },
  { deep: true, immediate: true }
)

const loadMessages = async (id: string) => {
  if (!id) return
  try {
    const { data } = await chatRoomStore.getChatMessages(id)
    data.reverse().forEach(msg => chatRoomStore.addMessage(msg))
  } catch (error) {
    console.error('메시지 조회 실패:', error)
    chatRoomStore.messages = []
  }
}

const sendMessage = async () => {
  const trimmed = newMessage.value.trim()
  if (!trimmed || !chatRoomStore.conversationId) return

  await chatRoomStore.createMessage({
    conversationId: chatRoomStore.conversationId,
    content: trimmed
  })

  newMessage.value = ''
  scrollToBottom()
}

const selectFeature = (feature: string) => console.log('선택된 기능:', feature)
</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chatRoom' || uiStore.currentTab === 'inviteChatRoom'"
    class="flex h-screen min-h-0 flex-col bg-[#dfdad1] relative"
  >
    <!-- 헤더 -->
    <div class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center">
      <button 
        @click="uiStore.currentTab = 'chat'"
        class="text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
      >
        <span>&lt;</span> 뒤로
      </button>

      <span class="text-xs font-bold tracking-wider truncate px-2 max-w-[150px]">
        {{ uiStore.roomName || (isGroupChat ? '그룹 채팅방' : '1:1 채팅방') }}
      </span>

      <div class="flex items-center gap-3">
        <!-- [수정됨] 그룹 채팅일 때만 대화 상대 목록 버튼 노출 -->
        <button 
          v-if="isGroupChat"
          @click="isMembersModalOpen = true; expandedMemberIndex = null"
          class="text-[#2d2b28] hover:text-white transition-colors flex items-center justify-center"
          title="대화 상대 목록"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM21 18.75a.75.75 0 0 0-.42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01Z" />
          </svg>
        </button>

        <button class="text-xs font-bold hover:text-white transition-colors">
          옵션
        </button>
      </div>
    </div>

    <!-- 채팅 메시지 목록 영역 -->
    <div ref="messageContainer" class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col">
      <div v-for="(message, index) in filteredMessages" :key="message.id">
        <!-- 날짜 구분선 -->
        <div
          v-if="index === 0 || !isSameDate(filteredMessages[index - 1].createdAt, message.createdAt)"
          class="flex justify-center my-3"
        >
          <span class="text-[10px] bg-[#c5bfb6] px-2 py-1 border-2 border-[#2d2b28] font-bold text-[#2d2b28]">
            {{ formatDate(message.createdAt) }}
          </span>
        </div>

        <ChatRoomMessage :message="message" :own-id="ownId" />
      </div>
    </div>

    <!-- 하단 입력창 영역 -->
    <div class="relative shrink-0 bg-[#c5bfb6] p-3 border-t-2 border-[#2d2b28]">
      <div class="flex gap-2 items-center">
        <ChatFeatureModal @select="selectFeature" />

        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          @keyup.enter="sendMessage"
          class="flex-1 bg-[#f4f1eb] text-xs p-2 border-2 border-[#2d2b28] text-[#2d2b28] placeholder-[#726e67] focus:outline-none focus:ring-0 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] h-9"
        />

        <button
          @click="sendMessage"
          class="bg-[#2d2b28] text-white text-xs font-bold px-4 h-9 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          전송
        </button>
      </div>
    </div>

    <!-- [수정됨] 대화 상대 및 초대 모달창 (그룹 채팅 전용) -->
    <div 
      v-if="isGroupChat && isMembersModalOpen" 
      class="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="isMembersModalOpen = false"
    >
      <div class="bg-[#dfdad1] w-80 border-2 border-[#2d2b28] shadow-[4px_4px_0px_0px_#2d2b28] flex flex-col">
        <div class="bg-[#c5bfb6] px-4 py-3 border-b-2 border-[#2d2b28] flex justify-between items-center">
          <span class="text-sm font-bold text-[#2d2b28]">대화 상대</span>
          <button @click="isMembersModalOpen = false" class="text-sm font-bold hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div class="p-3 flex-1 overflow-y-auto max-h-72 space-y-2 bg-[#2a2825]">
          <div 
            v-for="(member, index) in mockMembers" 
            :key="index"
            class="bg-[#423d38] border border-[#1e1c1a] flex flex-col cursor-pointer select-none"
          >
            <div @click="toggleMember(index)" class="flex items-center justify-between p-2 hover:bg-[#4d4742] transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-8 bg-black flex items-center justify-center border border-[#1e1c1a]">
                  <span class="text-xl">{{ member.icon }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-[#e4decb]">{{ member.name }}</span>
                  <span class="text-[11px] text-[#a49f91] mt-0.5">{{ member.status }}</span>
                </div>
              </div>
              <div class="text-[#a49f91] text-xs px-2">
                {{ expandedMemberIndex === index ? '▲' : '▼' }}
              </div>
            </div>

            <div v-show="expandedMemberIndex === index" class="flex bg-[#272522] border-t border-[#1e1c1a]">
              <button class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#d8d2c0] hover:bg-[#423d38] hover:text-white transition-colors border-r border-[#1e1c1a]">
                소개글
              </button>
              <button class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#ff5252] hover:bg-[#423d38] hover:text-[#ff7575] transition-colors">
                차단
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 border-t-2 border-[#2d2b28] bg-[#c5bfb6]">
          <button class="w-full bg-[#2d2b28] text-white text-sm font-bold px-4 py-2.5 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2">
            친구 초대하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>