<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useBlockStore } from '@/block/store/BlockStore.js'
import { useTranslatorStore } from '@/chat/store/AiTransStore.js'

import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import ChatFeatureModal, {
  type Feature
} from '@/chat/components/ChatFeatureModel.vue'

import GroupChatMembersModal, {
  type GroupChatMember
} from '@/chat/components/GroupChatMemberModal.vue'

import ChatSettingsModal from '@/chat/components/ChatSettingsModal.vue'
import StickerModal from '@/chat/components/StickerModal.vue'

import { Settings, X } from 'lucide-vue-next'

import {
  formatDate,
  isSameDate
} from '@/chat/composables/utils/chatDate.js'

import { useChatScroll } from '@/chat/composables/chatRoom.vue/useChatScroll.js'
import { useChatImage } from '@/chat/composables/chatRoom.vue/useChatImage.js'
import { useChatTranslate } from '@/chat/composables/chatRoom.vue/useChatTranslate.js'
import { useChatLeave } from '@/chat/composables/chatRoom.vue/useChatLeaves.js'

import { useCustomChatStore } from '../stores/CustomChatStore'
import { useChatMessages } from '../composable/useChatMessages'
import { customChatApi } from '../api/customChat.api.js'
import { ChatApi } from '@/chat/api/chat.api.js'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()
const authStore = useAuthStore()
const modalStore = useModalStore()
const friendStore = useFriendStore()
const blockStore = useBlockStore()
const translatorStore = useTranslatorStore()
const customChatStore = useCustomChatStore()

const { translate } = useChatTranslate()
const { loadMessages } = useChatMessages()

// =========================================================
// 기본 상태
// =========================================================

const ownId = computed(
  () => authStore.userInfo?.id
)

const newMessage = ref('')

const isMembersModalOpen = ref(false)

const isEntering = ref(false)

// =========================================================
// 현재 CUSTOM 방
// =========================================================

const currentRoom = computed(() => {

  const conversationId =
    chatRoomStore.conversationId

  
    

  if (!conversationId) {
    return null
  }

  return customChatStore.customRooms.find(
    room => room.id === conversationId
  ) ?? null
})

// =========================================================
// 메시지
// =========================================================

const filteredMessages = computed(() => {

  const conversationId =
    chatRoomStore.conversationId

  if (!conversationId) {
    return []
  }

  return chatRoomStore.messages.filter(
    message =>
      message.conversationId === conversationId
  )
})

// =========================================================
// 스크롤
// =========================================================

const messageContainer =
  ref<HTMLElement | null>(null)

const { scrollToBottom } =
  useChatScroll(
    messageContainer,
    () => filteredMessages.value
  )

// =========================================================
// 이미지
// =========================================================

const {
  fileInputRef,
  imagePreviewUrl,
  imageCaption,
  isImageModalOpen,
  isUploadingImage,
  handleFileChange,
  closeImageModal,
  sendImageMessage,
  openFilePicker
} = useChatImage({
  scrollToBottom
})

// =========================================================
// 대화방 나가기
// =========================================================

const conversationId = computed(
  () => chatRoomStore.conversationId
)

const {
  leaveChatRoom
} = useChatLeave({

  conversationId,

  onLeave: async () => {

    console.log(
      'CUSTOM 채팅방 나가기:',
      conversationId.value
    )

    // 실제 나가기 API 연결
  },

  onSuccess: () => {

    chatRoomStore.setConversationId(null)

    uiStore.conversationId = null

    uiStore.currentTab = 'groupChat'
  }
})

// =========================================================
// CUSTOM 방 진입
// =========================================================

const enterCustomRoom = async () => {

  const roomId =
    uiStore.conversationId

  if (!roomId) {
    return
  }

  if (isEntering.value) {
    return
  }

  isEntering.value = true

  try {

    // 이미 같은 방이면 다시 로드하지 않음
    if (
      chatRoomStore.conversationId !== roomId
    ) {

      chatRoomStore.setConversationId(
        roomId
      )
    }

    // 방 존재 여부 확인
    const exists =
      await chatRoomStore.existsConversation(
        roomId
      )

    if (!exists) {

      console.warn(
        '[CUSTOM ROOM] 존재하지 않는 방:',
        roomId
      )

      chatRoomStore.setConversationId(null)

      uiStore.conversationId = null
      uiStore.currentTab = 'groupChat'

      return
    }

    // 메시지 조회
    await loadMessages(roomId)

    // 읽음 처리
    // 프로젝트에서 필요하면 사용
    //
    // await chatStore.readConversation(roomId)

    await nextTick()

    requestAnimationFrame(() => {
      scrollToBottom()
    })

  } catch (error) {

    console.error(
      '[CUSTOM ROOM] 입장 실패:',
      error
    )

  } finally {

    isEntering.value = false
  }
}

// =========================================================
// CUSTOM 방 진입 감지
// =========================================================

watch(
  () => uiStore.conversationId,
  async (conversationId) => {

    if (
      uiStore.currentTab !== 'customChatRoom'
    ) {
      return
    }

    if (!conversationId) {
      return
    }

    await enterCustomRoom()
    customChatApi.joinCustomChat(conversationId);
  },
  {
    immediate: true
  }
)

// =========================================================
// 메시지 전송
// =========================================================

const sendMessage = async () => {

  const trimmed =
    newMessage.value.trim()

  if (!trimmed) {
    return
  }

  const conversationId =
    chatRoomStore.conversationId

  if (!conversationId) {
    return
  }

  try {

    await chatRoomStore.createMessage({
      conversationId,
      content: trimmed
    })

    newMessage.value = ''

    await nextTick()

    scrollToBottom()

  } catch (error) {

    console.error(
      'CUSTOM 메시지 전송 실패:',
      error
    )
  }
}

// =========================================================
// 기능 메뉴
// =========================================================

const selectFeature = async (
  feature: Feature
) => {

  switch (feature.id) {

    case 'AI':
      await translateWithAI()
      break

    case 'Sticker':
      modalStore.openModal('sticker')
      break

    case 'Image':
      openFilePicker()
      break
  }
}

// =========================================================
// AI 번역
// =========================================================

const translateWithAI = async () => {

  if (!newMessage.value.trim()) {
    return
  }

  const translatedText =
    await translate(newMessage.value)

  if (translatedText) {
    newMessage.value =
      translatedText
  }
}

// =========================================================
// 스티커
// =========================================================

const handleStickerSelect = (
  sticker: string
) => {

  newMessage.value += sticker
}

// =========================================================
// 초대
// =========================================================

const handleInvite = () => {

  console.log(
    'CUSTOM 채팅방 초대'
  )
}

// =========================================================
// 멤버 액션
// =========================================================

const handleMemberAction = async (
  action: string,
  member: GroupChatMember
) => {

  const friendId = member.id

  if (action === 'addFriend') {

    await friendStore.addFriendRequest({
      searchName: member.name
    })

    await friendStore.fetchFriends()

    return
  }

  uiStore.profileMenuFriendId =
    friendId

  if (action === 'viewBio') {

    modalStore.openModal(
      'viewBio'
    )

  } else if (action === 'block') {

    await blockStore.requestBlockUser(
      friendId
    )

  } else if (action === 'delete') {

    if (
      window.confirm(
        '정말 삭제하시겠습니까?'
      )
    ) {

      window.alert(
        '삭제 기능 준비중입니다.'
      )
    }
  }
}

// =========================================================
// 뒤로가기
// =========================================================

const goBack = () => {

  chatRoomStore.setConversationId(
    null
  )

  uiStore.conversationId = null

  uiStore.currentTab =
    'groupChat'
}

</script>


<template>

  <div
    v-if="uiStore.currentTab === 'customChatRoom'"
    class="flex h-screen min-h-0 flex-col bg-[#dfdad1] relative"
  >

    <!-- ================================================= -->
    <!-- 파일 업로드 -->
    <!-- ================================================= -->

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />


    <!-- ================================================= -->
    <!-- 헤더 -->
    <!-- ================================================= -->

    <div
      class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
    >

      <!-- 뒤로 -->
      <button
        type="button"
        @click="goBack"
        class="text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
      >
        <span>&lt;</span>
        뒤로
      </button>


      <!-- 방 정보 -->

      <div
        class="flex flex-col items-center min-w-0 px-2"
      >

        <div
          class="flex items-center gap-2 max-w-[220px]"
        >

          <!-- 공개 / 비밀 -->

          <span
            v-if="currentRoom?.isSecret"
            class="text-[10px] bg-red-600 text-white px-1 font-bold shrink-0"
          >
            🔒
          </span>

          <span
            v-else
            class="text-[10px] bg-blue-600 text-white px-1 font-bold shrink-0"
          >
            🌐
          </span>


          <span
            class="text-xs font-bold tracking-wider truncate"
          >
            {{
              currentRoom?.title
                || uiStore.roomName
                || 'CUSTOM 채팅방'
            }}
          </span>

        </div>


        <!-- 방장 / 인원 -->

        <span
          v-if="currentRoom"
          class="text-[9px] text-neutral-600 mt-0.5"
        >
          방장 {{ currentRoom.owner }}
          ·
          {{ currentRoom.members }}명
        </span>

      </div>


      <!-- 오른쪽 버튼 -->

      <div
        class="flex items-center gap-3"
      >

        <!-- 멤버 -->

        <button
          type="button"
          @click="isMembersModalOpen = true"
          class="text-[#2d2b28] hover:text-white transition-colors flex items-center justify-center"
          title="대화 상대 목록"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >

            <path
              d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1-6.75 0ZM21 18.75a.75.75 0 0 0-.42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0-5.06-1.01Z"
            />

          </svg>

        </button>


        <!-- 설정 -->

        <button
          type="button"
          @click="modalStore.openModal('chatRoomSettings')"
          class="hover:text-white transition-colors"
          title="채팅방 설정"
        >

          <Settings
            class="w-5 h-5 stroke-[2.5]"
          />

        </button>


        <!-- 나가기 -->

        <button
          type="button"
          @click="leaveChatRoom"
          class="text-[#2d2b28] hover:text-red-600 transition-colors flex items-center justify-center"
          title="채팅방 나가기"
        >

          <X
            class="w-5 h-5 stroke-[2.5]"
          />

        </button>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- 입장 로딩 -->
    <!-- ================================================= -->

    <div
      v-if="isEntering"
      class="flex-1 flex items-center justify-center text-xs font-bold text-neutral-500"
    >

      CUSTOM 채팅방에 접속하는 중...

    </div>


    <!-- ================================================= -->
    <!-- 메시지 -->
    <!-- ================================================= -->

    <div
      v-else
      ref="messageContainer"
      class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col"
    >

      <div
        v-for="(message, index) in filteredMessages"
        :key="message.id"
      >

        <!-- 날짜 -->

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
            class="text-[10px] bg-[#c5bfb6] px-2 py-1 border-2 border-[#2d2b28] font-bold text-[#2d2b28]"
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


      <!-- 메시지 없음 -->

      <div
        v-if="filteredMessages.length === 0"
        class="flex-1 flex items-center justify-center"
      >

        <div
          class="text-center text-[10px] text-neutral-500"
        >

          <div class="text-xl mb-2">
            💬
          </div>

          아직 메시지가 없습니다.

          <br>

          첫 메시지를 보내보세요.

        </div>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- 입력창 -->
    <!-- ================================================= -->

    <div
      class="relative shrink-0 bg-[#c5bfb6] p-3 border-t-2 border-[#2d2b28]"
    >

      <div
        class="flex gap-2 items-center"
      >

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
          type="button"
          @click="sendMessage"
          class="bg-[#2d2b28] text-white text-xs font-bold px-4 h-9 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          전송
        </button>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- 이미지 모달 -->
    <!-- ================================================= -->

    <Teleport to="body">

      <div
        v-if="isImageModalOpen"
        class="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4"
        @click.self="closeImageModal"
      >

        <div
          class="w-full max-w-md bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[8px_8px_0px_0px_#121315] flex flex-col overflow-hidden"
        >

          <div
            class="bg-[#2d2b28] text-[#fbf9f5] px-4 py-2 flex justify-between items-center text-xs font-bold"
          >

            <span>
              // 이미지_전송_프로토콜.img
            </span>

            <button
              type="button"
              @click="closeImageModal"
              class="hover:text-red-400 text-lg leading-none"
            >

              <X class="w-4 h-4" />

            </button>

          </div>


          <div
            class="p-4 flex flex-col gap-3"
          >

            <div
              class="w-full max-h-[300px] overflow-hidden rounded border-2 border-[#2d2b28] bg-black/5 flex items-center justify-center"
            >

              <img
                :src="imagePreviewUrl"
                alt="미리보기"
                class="max-w-full max-h-[290px] object-contain"
              />

            </div>


            <input
              v-model="imageCaption"
              type="text"
              placeholder="이미지에 대한 설명을 입력하세요 (선택)"
              @keyup.enter="sendImageMessage"
              class="w-full bg-[#f4f1eb] text-xs p-2.5 border-2 border-[#2d2b28] text-[#2d2b28] placeholder-[#726e67] focus:outline-none shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            />


            <div
              class="flex justify-end gap-2 mt-2"
            >

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

                <span
                  v-if="isUploadingImage"
                  class="animate-spin text-xs"
                >
                  🌀
                </span>

                <span>
                  {{
                    isUploadingImage
                      ? '업로드 중...'
                      : '전송'
                  }}
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>

    </Teleport>


    <!-- ================================================= -->
    <!-- 멤버 모달 -->
    <!-- ================================================= -->

    <GroupChatMembersModal
      :is-open="isMembersModalOpen"
      @close="isMembersModalOpen = false"
      @invite="handleInvite"
      @member-action="handleMemberAction"
    />


    <!-- 설정 -->

    <ChatSettingsModal />


    <!-- 스티커 -->

    <StickerModal
      @select="handleStickerSelect"
    />

  </div>

</template>