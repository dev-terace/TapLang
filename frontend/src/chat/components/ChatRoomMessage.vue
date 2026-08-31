<script setup lang="ts">
import {
  computed,
  ref,
  toRef
} from 'vue'
import { useI18n } from 'vue-i18n'

import { Volume2, Languages } from 'lucide-vue-next'

import { useChatSettingsStore } from '../store/ChatSettingsStore'
import { useTranslatorStore as useAiTranslatorStore } from '../store/AiTransStore.js'
import { ChatRoomApi } from '../api/chatRoom.api'
import { useMessageTranslation } from '../composables/chatRoomMessage.vue/useMessageTranslation'
import { useImageViewer } from '../composables/chatRoomMessage.vue/useImageViewer'
import { useMessageSpeech } from '../composables/chatRoomMessage.vue/useMessageSpeech'

const { t } = useI18n()

const props = defineProps<{
  message: {
    id: string | number
    senderId: string | number
    senderName: string
    flag: string
    content: string
    attachments?: ChatRoomApi.Attachment[] | null
    createdAt: string
  }
  ownId: number | null
}>()

const isMine = computed(() => {
  return props.message.senderId === props.ownId
})

const chatSettingsStore = useChatSettingsStore()
const translatorStore = useAiTranslatorStore()

const messageRef = toRef(props, 'message')

const {
  translatedText,
  isThisMessageTranslating,
  isOtherMessageTranslating,
  translateMessage
} = useMessageTranslation(
  messageRef,
  chatSettingsStore,
  translatorStore
)

const {
  speakOriginal,
  speakTranslated,
  stopSpeech
} = useMessageSpeech(
  chatSettingsStore
)

const {
  selectedImageUrl,
  imageScale,
  imageTransformOrigin,
  openImageModal,
  closeImageModal,
  handleImageWheel,
  handleImageDoubleClick
} = useImageViewer()

// =====================================================
// 이미지 만료 상태
// =====================================================

const expiredImages = ref<Set<string>>(new Set())

const handleImageError = (guid: string) => {
  expiredImages.value.add(guid)
}

const isImageExpired = (guid: string) => {
  return expiredImages.value.has(guid)
}
</script>

<template>
  <div class="flex gap-2 items-start">

    <!-- 상대방 아바타 -->
    <div
      v-if="!isMine"
      class="w-8 h-8 shrink-0
             bg-[#2d2b28]
             text-white
             flex items-center justify-center
             border-2 border-[#2d2b28]
             font-pixel text-sm"
    >
      <img
        :src="`https://flagcdn.com/w40/${message.flag}.png`"
        alt=""
        class="w-5 h-3.5
               object-cover
               border border-[#2d2b28]
               flex-shrink-0"
      />
    </div>

    <!-- 메시지 영역 -->
    <div
      class="flex flex-col gap-1 min-w-0"
      :class="isMine ? 'items-end ml-auto' : ''"
    >
      <!-- 상대방 이름 -->
      <span
        v-if="!isMine"
        class="text-[10px]
               font-bold
               text-[#2d2b28]"
      >
        {{ message.senderName }}
      </span>

      <!-- 첨부 이미지 -->
      <div
        v-if="message.attachments?.length"
        class="flex flex-col gap-2"
      >
        <template
          v-for="attachment in message.attachments"
          :key="attachment.guid"
        >
          <!-- 만료된 이미지 -->
          <div
            v-if="isImageExpired(attachment.guid)"
            class="relative
                   w-[260px]
                   h-[180px]
                   overflow-hidden
                   border-2
                   border-[#2d2b28]
                   bg-[#d8d3cb]
                   select-none"
          >
            <div
              class="absolute inset-0
                    opacity-30
                    bg-[linear-gradient(135deg,#b8b2aa_25%,transparent_25%,transparent_50%,#b8b2aa_50%,#b8b2aa_75%,transparent_75%)]
                    bg-[length:28px_28px]"
            ></div>

            <div
              class="absolute inset-0
                    flex
                    items-center
                    justify-center
                    opacity-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2"
                class="w-24 h-24 text-[#726e67]"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>

            <!-- 중앙 내용 -->
            <div
              class="absolute inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-2"
            >
              <div
                class="w-11
                       h-11
                       rounded-full
                       bg-[#f4f1eb]
                       border-2
                       border-[#726e67]
                       flex
                       items-center
                       justify-center
                       shadow-[2px_2px_0px_0px_#726e67]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="w-5 h-5 text-[#726e67]"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>

              <!-- 문구 -->
              <div
                class="flex
                       flex-col
                       items-center
                       gap-0.5"
              >
                <span
                  class="text-[11px]
                        font-bold
                        text-[#2d2b28]"
                >
                  {{ t('chat-room-message.imageExpiredTitle') }}
                </span>

                <span
                  class="text-[9px]
                        text-[#726e67]"
                >
                  {{ t('chat-room-message.imageExpiredDesc') }}
                </span>
              </div>
            </div>
          </div>

          <!-- 정상 이미지 -->
          <img
            v-else
            :src="attachment.url"
            :alt="t('chat-room-message.attachmentAlt')"
            @error="handleImageError(attachment.guid)"
            @click.stop="openImageModal(attachment.url)"
            class="max-w-[260px]
                   max-h-[300px]
                   object-contain
                   border-2
                   border-[#2d2b28]
                   cursor-pointer
                   hover:opacity-90
                   transition-opacity
                   select-none"
          />
        </template>
      </div>

      <!-- 원본 메시지 말풍선 -->
      <div
        v-if="message.content"
        @dblclick="translateMessage"
        class="flex items-start
               gap-1.5
               p-2
               text-xs
               border-2
               border-[#2d2b28]
               shadow-[2px_2px_0px_0px_#2d2b28]
               max-w-[75%]
               sm:max-w-[320px]
               break-words
               cursor-pointer
               select-text
               transition-all
               duration-200"
        :class="[
          isMine
            ? 'bg-[#2d2b28] text-[#fbf9f5]'
            : 'bg-[#f4f1eb] text-[#2d2b28]',
          isThisMessageTranslating
            ? 'animate-pulse scale-[0.98] opacity-70'
            : '',
          isOtherMessageTranslating
            ? 'opacity-60 cursor-not-allowed'
            : ''
        ]"
        :title="
          isOtherMessageTranslating
            ? t('chat-room-message.translatingOtherMessage')
            : t('chat-room-message.doubleClickToTranslate')
        "
      >
        <!-- 원본 음성 버튼 -->
        <button
          type="button"
          @click.stop="speakOriginal(message.content)"
          class="shrink-0
                 hover:opacity-60
                 active:scale-90
                 transition-all"
          :title="t('chat-room-message.listenOriginal')"
        >
          <Volume2 class="w-3.5 h-3.5" />
        </button>

        <!-- 현재 메시지 번역 로딩 -->
        <div
          v-if="isThisMessageTranslating"
          class="flex items-center gap-1.5"
        >
          <span class="flex gap-1">
            <span
              class="w-1.5 h-1.5
                     rounded-full
                     bg-current
                     animate-bounce"
            />
            <span
              class="w-1.5 h-1.5
                     rounded-full
                     bg-current
                     animate-bounce"
              style="animation-delay: 150ms"
            />
            <span
              class="w-1.5 h-1.5
                     rounded-full
                     bg-current
                     animate-bounce"
              style="animation-delay: 300ms"
            />
          </span>

          <span class="text-[10px] opacity-70">
            {{ t('chat-room-message.translating') }}
          </span>
        </div>

        <!-- 원본 메시지 -->
        <span
          v-else
          class="break-words
                 whitespace-pre-wrap
                 min-w-0"
        >
          {{ message.content }}
        </span>
      </div>

      <!-- 번역 결과 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-1 scale-95"
      >
        <div
          v-if="translatedText"
          class="max-w-[75%]
                 sm:max-w-[320px]
                 p-2
                 text-xs
                 border-2
                 border-[#726e67]
                 bg-[#ebe7df]
                 text-[#2d2b28]
                 shadow-[2px_2px_0px_0px_#726e67]"
        >
          <!-- 번역 헤더 -->
          <div
            class="flex items-center
                   justify-between
                   gap-2
                   mb-1"
          >
            <div
              class="flex items-center
                     gap-1
                     text-[9px]
                     font-bold
                     text-[#726e67]"
            >
              <Languages class="w-3 h-3" />
              <span>
                {{
                  chatSettingsStore.languages.find(
                    language =>
                      language.code ===
                      chatSettingsStore.messageTranslateLanguage
                  )?.nativeName
                }}
              </span>
            </div>

            <!-- 번역 음성 버튼 -->
            <button
              type="button"
              @click.stop="speakTranslated(translatedText)"
              class="shrink-0
                     text-[#2d2b28]
                     hover:opacity-60
                     active:scale-90
                     transition-all"
              :title="t('chat-room-message.listenTranslated')"
            >
              <Volume2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- 번역 결과 -->
          <span
            class="break-words
                   whitespace-pre-wrap"
          >
            {{ translatedText }}
          </span>
        </div>
      </Transition>

      <!-- 시간 -->
      <span
        class="text-[9px]
               text-[#726e67]"
      >
        {{ message.createdAt }}
      </span>
    </div>

    <!-- 이미지 전체 화면 모달 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedImageUrl"
          class="fixed inset-0
                 z-[9999]
                 bg-black/80
                 flex items-center
                 justify-center
                 p-4
                 overflow-hidden"
          @click="closeImageModal"
        >
          <!-- 확대 이미지 -->
          <img
            :src="selectedImageUrl"
            :alt="t('chat-room-message.zoomedImageAlt')"
            class="max-w-[95vw]
                   max-h-[90vh]
                   object-contain
                   transition-transform
                   duration-100
                   select-none
                   cursor-zoom-in"
            :style="{
              transform: `scale(${imageScale})`,
              transformOrigin: imageTransformOrigin
            }"
            @click.stop
            @dblclick.stop="handleImageDoubleClick"
            @wheel.prevent="handleImageWheel"
          />
        </div>
      </Transition>
    </Teleport>

  </div>
</template>