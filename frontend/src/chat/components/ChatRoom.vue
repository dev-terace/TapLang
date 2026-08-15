<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useChatStore } from '@/chat/store/Chat'
import { useAuthStore } from '@/shared/auth/AuthStore'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import ChatFeatureModal, { type Feature } from './ChatFeatureModel.vue'
import GroupChatMembersModal, { type GroupChatMember } from './GroupChatMemberModal.vue'
import { useChatScroll } from '@/chat/composables/useChatScroll'
import { formatDate, isSameDate } from '@/chat/composables/chatDate'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useBlockStore } from '@/block/store/BlockStore.js'
import { useTranslatorStore } from '../store/AiTransStore.js'
import { Settings, X } from 'lucide-vue-next'
import ChatSettingsModal from './ChatSettingsModal.vue'
import { useChatSettingsStore } from '../store/ChatSettingsStore.js'
import StickerModal from './StickerModal.vue'
import axios from 'axios' // 이미지 업로드용 (프로젝트의 axios 인스턴스로 대체 가능)

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const modalStore = useModalStore()
const friendStore = useFriendStore()
const blockStore = useBlockStore()
const translatorStore = useTranslatorStore()
const chatSettingsStore = useChatSettingsStore()

const ownId = computed(() => authStore.userInfo?.id)
const newMessage = ref('')

// ----------------------------------------------------
// 📷 이미지 업로드 & 미리보기 관련 State
// ----------------------------------------------------
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const imageCaption = ref('') // 이미지 설명
const isImageModalOpen = ref(false)
const isUploadingImage = ref(false)

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
}

const handleStickerSelect = (sticker: string) => {
  newMessage.value += sticker
}

const isProcessing = ref(false)

// ----------------------------------------------------
// 🖼️ 이미지 처리 로직 (파일 선택 / Paste / 업로드)
// ----------------------------------------------------

// 1. 파일이 선택되었을 때 (파일 탐색기 또는 Ctrl+V)
const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.')
    return
  }

  selectedFile.value = file
  
  // 기존 프리뷰 URL 메모리 해제 및 새로 생성
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  imagePreviewUrl.value = URL.createObjectURL(file)
  imageCaption.value = ''
  isImageModalOpen.value = true
}

// 2. 파일 탐색기 인풋 변경 감지
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    processFile(target.files[0])
  }
  // input value 초기화 (동일 파일 재선택 가능하게)
  target.value = ''
}

// 3. Ctrl + V 붙여넣기 이벤트 핸들러
const handlePaste = (e: ClipboardEvent) => {
  if (uiStore.currentTab !== 'chatRoom' && uiStore.currentTab !== 'inviteChatRoom') return

  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        processFile(file)
      }
      break
    }
  }
}

// 4. 이미지 모달 닫기
const closeImageModal = () => {
  isImageModalOpen.value = false
  selectedFile.value = null
  imageCaption.value = ''
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }
}

// 5. 이미지 업로드 및 채팅 메시지 전송
const sendImageMessage = async () => {
  if (!selectedFile.value || !chatRoomStore.conversationId) return

  try {
    isUploadingImage.value = true

    // A. 이미지 파일 백엔드 업로드
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    const { data } = await axios.post('/api/image/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })


    console.log("sendImageMessage data", data);
    // B. 업로드 후 발급받은 URL을 attachments로 메시지 전송
    await chatRoomStore.createMessage({
      conversationId: chatRoomStore.conversationId,
      content: imageCaption.value.trim(), // 사진 설명이 메시지 텍스트가 됨
      attachments: [
        {
          url: data.url, // /api/image/guid...
          guid: data.guid
        }
      ]
    })

    closeImageModal()
    scrollToBottom()

  } catch (error) {
    console.error('이미지 전송 실패:', error)
    alert('이미지 업로드 중 오류가 발생했습니다.')
  } finally {
    isUploadingImage.value = false
  }
}

// 이벤트 리스너 등록
onMounted(() => {
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
})

// ==================================================
// 기존 대화방 진입 및 메시지 워처
// ==================================================
watch(
  () => ({
    conversationId: uiStore.conversationId,
    memberIds: [...uiStore.chatRoomMemberIds],
    currentTab: uiStore.currentTab,
    isChatRoomCreate: uiStore.isChatRoomCreate
  }),
  async (state) => {
    const { conversationId, memberIds, currentTab, isChatRoomCreate } = state

    if (currentTab !== 'chatRoom' && currentTab !== 'inviteChatRoom') return
    if (isProcessing.value) return

    if (conversationId) {
      isProcessing.value = true
      try {
        chatRoomStore.conversationId = conversationId
        const exists = await chatRoomStore.existsConversation(conversationId)
        if (!exists) return

        if (currentTab === 'inviteChatRoom') {
          await chatRoomStore.joinConversation(conversationId, memberIds)
        }

        if (!chatRoomStore.hasMessageCache(conversationId)) {
          await loadMessages(conversationId)
        }

        await chatStore.readConversation(conversationId)
        await chatStore.getMyConversations()

        await nextTick()
        requestAnimationFrame(() => scrollToBottom())
      } catch (error) {
        console.error('기존 채팅방 진입 실패:', error)
      } finally {
        isProcessing.value = false
      }
      return
    }

    if (!isChatRoomCreate) return
    if (memberIds.length === 0) return

    isProcessing.value = true
    try {
      const chatType = currentTab === 'inviteChatRoom' ? 'GROUP' : memberIds.length > 1 ? 'GROUP' : 'DIRECT'

      const newConversationId = await chatRoomStore.createChat({
        memberIds,
        chatType,
        name: chatType === 'GROUP' ? uiStore.roomName : null,
        message: ''
      })

      chatRoomStore.conversationId = newConversationId
      uiStore.conversationId = newConversationId
      uiStore.isChatRoomCreate = false

      if (chatType === 'GROUP') {
        await chatRoomStore.joinConversation(newConversationId, memberIds)
      }

      await loadMessages(newConversationId)
      await chatStore.readConversation(newConversationId)
      await chatStore.getMyConversations()

      await nextTick()
      requestAnimationFrame(() => scrollToBottom())
    } catch (error) {
      console.error('새 채팅방 생성 실패:', error)
    } finally {
      isProcessing.value = false
    }
  },
  { immediate: true }
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

const selectFeature = async (feature: Feature) => {
  switch (feature.id) {
    case "AI":
      await translateWithAI();
      break;

    case "Sticker":
      modalStore.openModal('sticker')
      break;

    case "Image":
      // 📷 파일 탐색기 열기
      fileInputRef.value?.click();
      break;
  }
};

const translateWithAI = async () => {
  const text = newMessage.value.trim();
  if (!text) return;

  try {
    const chatSourceLanguage = chatSettingsStore.chatSourceLanguage
    const chatTargetLanguage = chatSettingsStore.chatTargetLanguage

    const result = await translatorStore.translateInput(
      `${chatSourceLanguage}<->${chatTargetLanguage}`,
      text
    )

    if (result === false) {
      alert("번역할 수 없는 내용입니다.");
      return;
    }

    if (result) {
      newMessage.value = result.translatedText;
    }
  } catch (error) {
    console.error(error);
    alert("AI 번역에 실패했습니다.");
  }
};

const handleMemberAction = async (action: string, member: GroupChatMember) => {
  const friendId = member.id
  if (action === 'addFriend') {
    await friendStore.addFriendRequest({ searchName: member.name })
    await friendStore.fetchFriends();
  } else {
    uiStore.profileMenuFriendId = friendId
    if (action === 'viewBio') {
      modalStore.openModal('viewBio')
    } else if (action === 'block') {
      await blockStore.requestBlockUser(friendId)
    } else if (action === 'delete') {
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
    <!-- 숨겨진 이미지 File Input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

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

        <button @click="modalStore.openModal('chatRoomSettings')" class="hover:text-white transition-colors">
          <Settings class="w-5 h-5 stroke-[2.5]" />
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
        <ChatFeatureModal
          :loading="translatorStore.isInputTranslating"
          @select="selectFeature"
        />

        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요... (이미지 붙여넣기 Ctrl+V 가능)"
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

    <!-- 🖼️ 이미지 미리보기 및 설명 입력 모달 -->
    <Teleport to="body">
      <div
        v-if="isImageModalOpen"
        class="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4"
        @click.self="closeImageModal"
      >
        <div class="w-full max-w-md bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[8px_8px_0px_0px_#121315] flex flex-col overflow-hidden">
          
          <!-- 모달 헤더 -->
          <div class="bg-[#2d2b28] text-[#fbf9f5] px-4 py-2 flex justify-between items-center text-xs font-bold">
            <span>// 이미지_전송_프로토콜.img</span>
            <button type="button" @click="closeImageModal" class="hover:text-red-400 text-lg leading-none">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 미리보기 영역 -->
          <div class="p-4 flex flex-col gap-3">
            <div class="w-full max-h-[300px] overflow-hidden rounded border-2 border-[#2d2b28] bg-black/5 flex items-center justify-center">
              <img
                :src="imagePreviewUrl"
                alt="미리보기"
                class="max-w-full max-h-[290px] object-contain"
              />
            </div>

            <!-- 설명 입력창 -->
            <input
              v-model="imageCaption"
              type="text"
              placeholder="이미지에 대한 설명을 입력하세요 (선택)"
              @keyup.enter="sendImageMessage"
              class="w-full bg-[#f4f1eb] text-xs p-2.5 border-2 border-[#2d2b28] text-[#2d2b28] placeholder-[#726e67] focus:outline-none shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            />

            <!-- 버튼 영역 -->
            <div class="flex justify-end gap-2 mt-2">
              <button
                type="button"
                @click="closeImageModal"
                :disabled="isUploadingImage"
                class="px-3 py-1.5 bg-white text-[#2d2b28] text-xs font-bold border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                취소
              </button>
              <button
                type="button"
                @click="sendImageMessage"
                :disabled="isUploadingImage"
                class="px-4 py-1.5 bg-[#2d2b28] text-white text-xs font-bold border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2"
              >
                <span v-if="isUploadingImage" class="animate-spin text-xs">🌀</span>
                <span>{{ isUploadingImage ? '업로드 중...' : '전송' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 그룹 채팅 모달 등 나머지 유지 -->
    <GroupChatMembersModal
      v-if="isGroupChat"
      :is-open="isMembersModalOpen"
      @close="isMembersModalOpen = false"
      @invite="handleInvite"
      @member-action="handleMemberAction"
    />
    <ChatSettingsModal />
    <StickerModal @select="handleStickerSelect" />
  </div>
</template>