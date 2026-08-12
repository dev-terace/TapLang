<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useChatStore } from '@/chat/store/Chat'
import { useAuthStore } from '@/shared/auth/AuthStore'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import ChatFeatureModal from './ChatFeatureModel.vue'
import GroupChatMembersModal from './GroupChatMemberModal.vue' // ✅ 분리한 모달 import
import { useChatScroll } from '@/chat/composables/useChatScroll'
import { formatDate, isSameDate } from '@/chat/composables/chatDate'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useBlockStore } from '@/block/store/BlockStore.js'
import { type GroupChatMember } from './GroupChatMemberModal.vue'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const modalStore = useModalStore()
const friendStore = useFriendStore()
const blockStore = useBlockStore()

const ownId = computed(() => authStore.userInfo?.id)
const newMessage = ref('')

// 1:1 채팅과 그룹 채팅을 정확하게 구분하는 로직
const isGroupChat = computed(() => {
  if (uiStore.currentTab === 'inviteChatRoom') return true
  if (uiStore.chatRoomMemberIds && uiStore.chatRoomMemberIds.length > 1) return true
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


// 초대 버튼 클릭 핸들러
const handleInvite = () => {
  console.log('초대하기 버튼 클릭됨')
  // 여기에 실제 초대 탭 이동 혹은 초대 로직을 구현합니다.
  // 예: uiStore.currentTab = 'inviteFriends' 
  // isMembersModalOpen.value = false
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


const handleMemberAction = async (action: string, member: GroupChatMember ) => {
  
  const friendId = member.id
  console.log('선택된 멤버 액션:', action, '멤버 ID:', friendId)

  if (action === 'addFriend') {
    

      await friendStore.addFriendRequest({searchName: member.name})
      await friendStore.fetchFriends();

  } else {
    // 질문자님이 작성해주신 로직 적용
    uiStore.profileMenuFriendId = friendId
    
    if (action === 'viewBio') {
       modalStore.openModal('viewBio') 
       console.log('소개글 보기 모달 오픈')
    }
    else if (action === 'block') {
      await blockStore.requestBlockUser(friendId)
    }
    else if (action === 'delete') {
      if (confirm('정말 삭제하시겠습니까?')) {
        alert('삭제 기능 준비중입니다.')
      }
    }
  }
}

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
        <!-- 그룹 채팅일 때만 대화 상대 목록 버튼 노출 -->
        <button 
          v-if="isGroupChat"
          @click="isMembersModalOpen = true"
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

    <!-- ✅ 분리된 그룹 채팅 전용 모달 컴포넌트 적용 -->
    <GroupChatMembersModal
      v-if="isGroupChat"
      :is-open="isMembersModalOpen"
      @close="isMembersModalOpen = false"
      @invite="handleInvite"
      @member-action="handleMemberAction"
    />
  </div>
</template>