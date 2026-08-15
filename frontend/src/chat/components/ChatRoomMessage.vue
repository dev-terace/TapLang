<script setup lang="ts">
import { computed, ref } from 'vue'
import { Volume2, Languages } from 'lucide-vue-next'

import { useChatSettingsStore } from '../store/ChatSettingsStore'
import { useTranslatorStore as useAiTranslatorStore } from '../store/AiTransStore.js'
import { ChatRoomApi } from '../api/chatRoom.api'

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
  ownId: string | number
}>()

const isMine = computed(() => {
  return props.message.senderId === props.ownId
})

const chatSettingsStore = useChatSettingsStore()
const translatorStore = useAiTranslatorStore()

// =====================================================
// 번역 결과
// =====================================================

const translatedText = ref<string | null>(null)

// =====================================================
// 현재 메시지가 번역 중인지
// =====================================================

const isThisMessageTranslating = computed(() => {
  return (
    translatorStore.isMessageTranslating &&
    translatorStore.translatingMessageId === props.message.id
  )
})

// =====================================================
// 다른 메시지가 번역 중인지
// =====================================================

const isOtherMessageTranslating = computed(() => {
  return (
    translatorStore.isMessageTranslating &&
    translatorStore.translatingMessageId !== props.message.id
  )
})

// =====================================================
// 음성 언어 매핑
// =====================================================

const speechLanguages: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN'
}

// =====================================================
// 원본 메시지 음성
// =====================================================

const getOriginalSpeechLanguage = () => {
  const language = chatSettingsStore.originalVoiceLanguage

  if (language === 'auto') {
    return navigator.language
  }

  return speechLanguages[language] ?? 'en-US'
}

const speakMessage = () => {
  if (!props.message.content.trim()) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(
    props.message.content
  )

  utterance.lang = getOriginalSpeechLanguage()
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

// =====================================================
// 번역 메시지 음성
// =====================================================

const getTranslationSpeechLanguage = () => {
  const language =
    chatSettingsStore.translatedVoiceLanguage

  return speechLanguages[language] ?? 'en-US'
}

const speakTranslatedMessage = () => {
  if (!translatedText.value) return

  window.speechSynthesis.cancel()

  const utterance =
    new SpeechSynthesisUtterance(
      translatedText.value
    )

  utterance.lang =
    getTranslationSpeechLanguage()

  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

// =====================================================
// 메시지 번역
// =====================================================

const translateMessage = async () => {

  // 다른 메시지가 번역 중
  if (isOtherMessageTranslating.value) {
    return
  }

  // 현재 메시지가 번역 중
  if (isThisMessageTranslating.value) {
    return
  }

  // 이미 번역되어 있으면 닫기
  if (translatedText.value) {
    translatedText.value = null
    window.speechSynthesis.cancel()
    return
  }

  const text =
    props.message.content.trim()

  if (!text) return

  try {

    const targetLanguage =
      chatSettingsStore.messageTranslateLanguage

    console.log(
      '번역 대상 언어:',
      targetLanguage
    )

    console.log(
      '번역할 메시지:',
      text
    )

    const result =
      await translatorStore.translateMessage(
        props.message.id,
        targetLanguage,
        text
      )

    if (!result) {
      return
    }

    translatedText.value =
      result.translatedText

  } catch (error) {

    console.error(
      '메시지 번역 실패:',
      error
    )
  }
}

// =====================================================
// 이미지 만료 상태
// =====================================================

// 이미지 GUID를 기준으로 만료된 이미지 관리
const expiredImages = ref<Set<string>>(new Set())

// 이미지 로딩 실패
const handleImageError = (guid: string) => {
  expiredImages.value.add(guid)
}

// 해당 이미지가 만료되었는지 확인
const isImageExpired = (guid: string) => {
  return expiredImages.value.has(guid)
}

// =====================================================
// 이미지 모달
// =====================================================

const selectedImageUrl =
  ref<string | null>(null)

const imageScale = ref(1)

const imageTransformOrigin =
  ref('center center')

// =====================================================
// 이미지 모달 열기
// =====================================================

const openImageModal = (url: string) => {

  if (!url) return

  selectedImageUrl.value = url

  imageScale.value = 1

  imageTransformOrigin.value =
    'center center'
}

// =====================================================
// 이미지 모달 닫기
// =====================================================

const closeImageModal = () => {

  selectedImageUrl.value = null

  imageScale.value = 1

  imageTransformOrigin.value =
    'center center'
}

// =====================================================
// 이미지 확대 / 축소
// 마우스 위치 기준
// =====================================================

const handleImageWheel = (
  event: WheelEvent
) => {

  event.preventDefault()

  const image =
    event.currentTarget as HTMLImageElement

  const rect =
    image.getBoundingClientRect()

  // 마우스 위치 계산
  const x =
    ((event.clientX - rect.left) / rect.width) * 100

  const y =
    ((event.clientY - rect.top) / rect.height) * 100

  imageTransformOrigin.value =
    `${x}% ${y}%`

  const zoomStep = 0.15

  if (event.deltaY < 0) {

    // 위로 스크롤 = 확대
    imageScale.value =
      Math.min(
        imageScale.value + zoomStep,
        4
      )

  } else {

    // 아래로 스크롤 = 축소
    imageScale.value =
      Math.max(
        imageScale.value - zoomStep,
        0.5
      )
  }
}

// =====================================================
// 이미지 더블클릭 확대
// =====================================================

const handleImageDoubleClick = (
  event: MouseEvent
) => {

  const image =
    event.currentTarget as HTMLImageElement

  const rect =
    image.getBoundingClientRect()

  const x =
    ((event.clientX - rect.left) / rect.width) * 100

  const y =
    ((event.clientY - rect.top) / rect.height) * 100

  imageTransformOrigin.value =
    `${x}% ${y}%`

  imageScale.value =
    Math.min(
      imageScale.value + 0.5,
      4
    )
}
</script>


<template>

  <div class="flex gap-2 items-start">

    <!-- ================================================= -->
    <!-- 상대방 아바타 -->
    <!-- ================================================= -->

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


    <!-- ================================================= -->
    <!-- 메시지 영역 -->
    <!-- ================================================= -->

    <div
      class="flex flex-col gap-1 min-w-0"
      :class="isMine ? 'items-end ml-auto' : ''"
    >

      <!-- ================================================= -->
      <!-- 상대방 이름 -->
      <!-- ================================================= -->

      <span
        v-if="!isMine"
        class="text-[10px]
               font-bold
               text-[#2d2b28]"
      >
        {{ message.senderName }}
      </span>


      <!-- ================================================= -->
      <!-- 첨부 이미지 -->
      <!-- ================================================= -->

      <div
        v-if="message.attachments?.length"
        class="flex flex-col gap-2"
      >

        <template
          v-for="attachment in message.attachments"
          :key="attachment.guid"
        >

          <!-- ================================================= -->
          <!-- 만료된 이미지 -->
          <!-- ================================================= -->

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
          <!-- 사진이었던 느낌을 주는 배경 -->
          <div
            class="absolute inset-0
                  opacity-30
                  bg-[linear-gradient(135deg,#b8b2aa_25%,transparent_25%,transparent_50%,#b8b2aa_50%,#b8b2aa_75%,transparent_75%)]
                  bg-[length:28px_28px]"
          ></div>

          <!-- 흐릿한 사진 느낌 -->
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
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
              />

              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
              />

              <path
                d="m21 15-5-5L5 21"
              />
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

            <!-- 이미지 아이콘 -->
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
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                />

                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                />

                <path
                  d="m21 15-5-5L5 21"
                />
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
                사진이 만료되었습니다
              </span>

              <span
                class="text-[9px]
                      text-[#726e67]"
              >
                보관 기간이 지나 삭제된 사진입니다
              </span>

            </div>

          </div>
        </div>


          <!-- ================================================= -->
          <!-- 정상 이미지 -->
          <!-- ================================================= -->

          <img
            v-else
            :src="attachment.url"
            alt="첨부 이미지"

            @error="
              handleImageError(attachment.guid)
            "

            @click.stop="
              openImageModal(attachment.url)
            "

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


      <!-- ================================================= -->
      <!-- 원본 메시지 말풍선 -->
      <!-- ================================================= -->

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
            ? '다른 메시지를 번역하는 중입니다.'
            : '더블클릭하여 번역'
        "
      >

        <!-- ================================================= -->
        <!-- 원본 음성 버튼 -->
        <!-- ================================================= -->

        <button
          type="button"
          @click.stop="speakMessage"

          class="shrink-0
                 hover:opacity-60
                 active:scale-90
                 transition-all"

          title="원문 음성으로 듣기"
        >

          <Volume2
            class="w-3.5 h-3.5"
          />

        </button>


        <!-- ================================================= -->
        <!-- 현재 메시지 번역 로딩 -->
        <!-- ================================================= -->

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
            번역 중
          </span>

        </div>


        <!-- ================================================= -->
        <!-- 원본 메시지 -->
        <!-- ================================================= -->

        <span
          v-else
          class="break-words
                 whitespace-pre-wrap
                 min-w-0"
        >
          {{ message.content }}
        </span>

      </div>


      <!-- ================================================= -->
      <!-- 번역 결과 -->
      <!-- ================================================= -->

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

              <Languages
                class="w-3 h-3"
              />

              <span>
                {{
                  chatSettingsStore.languages.find(
                    language =>
                      language.code ===
                      chatSettingsStore
                        .messageTranslateLanguage
                  )?.nativeName
                }}
              </span>

            </div>


            <!-- 번역 음성 버튼 -->

            <button
              type="button"
              @click.stop="speakTranslatedMessage"

              class="shrink-0
                     text-[#2d2b28]
                     hover:opacity-60
                     active:scale-90
                     transition-all"

              title="번역 음성으로 듣기"
            >

              <Volume2
                class="w-3.5 h-3.5"
              />

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


      <!-- ================================================= -->
      <!-- 시간 -->
      <!-- ================================================= -->

      <span
        class="text-[9px]
               text-[#726e67]"
      >
        {{ message.createdAt }}
      </span>

    </div>


    <!-- ================================================= -->
    <!-- 이미지 전체 화면 모달 -->
    <!-- ================================================= -->

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

          <!-- ================================================= -->
          <!-- 확대 이미지 -->
          <!-- ================================================= -->

          <img
            :src="selectedImageUrl"
            alt="확대 이미지"

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

            @dblclick.stop="
              handleImageDoubleClick
            "

            @wheel.prevent="
              handleImageWheel
            "
          />

        </div>

      </Transition>

    </Teleport>

  </div>

</template>