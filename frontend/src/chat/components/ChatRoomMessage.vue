<script setup lang="ts">
import { computed, ref } from 'vue'
import { Volume2, Languages } from 'lucide-vue-next'

import { useChatSettingsStore } from '../store/ChatSettingsStore'
import { useTranslatorStore as useAiTranslatorStore } from '../store/AiTransStore.js'

const props = defineProps<{
  message: {
    id: string | number
    senderId: string | number
    senderName: string
    flag: string
    content: string
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
// 음성 언어 설정
// =====================================================

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

  // 자동 감지
  if (language === 'auto') {
    // 메시지에 원본 언어 정보가 있다면 여기서 사용
    // 현재는 브라우저 기본 언어 사용
    return navigator.language
  }

  return speechLanguages[language] ?? 'en-US'
}


const speakMessage = () => {
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

  // -----------------------------------------------
  // 다른 메시지가 번역 중이면 실행하지 않음
  // -----------------------------------------------

  if (isOtherMessageTranslating.value) {
    return
  }


  // -----------------------------------------------
  // 현재 메시지가 번역 중이면 실행하지 않음
  // -----------------------------------------------

  if (isThisMessageTranslating.value) {
    return
  }


  // -----------------------------------------------
  // 이미 번역되어 있다면 닫기
  // -----------------------------------------------

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


    // ---------------------------------------------
    // Store에서 메시지 번역
    // ---------------------------------------------

    const result =
      await translatorStore.translateMessage(
        props.message.id,
        targetLanguage,
        text
      )


    // 번역 실패 / 취소
    if (!result) {
      return
    }


    // 번역 성공
    translatedText.value =
      result.translatedText

  } catch (error) {

    console.error(
      '메시지 번역 실패:',
      error
    )
  }
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
      <!-- 원본 메시지 말풍선 -->
      <!-- ================================================= -->

      <div
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
          <Volume2 class="w-3.5 h-3.5" />
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

              @click.stop="
                speakTranslatedMessage
              "

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

  </div>

</template>