import { computed, ref, type Ref } from 'vue'

import type { useChatSettingsStore } from '@/chat/store/ChatSettingsStore.js'
import type { useTranslatorStore } from '@/chat/store/AiTransStore'

type Message = {
  id: string | number
  content: string
}

export function useMessageTranslation(
  message: Ref<Message>,
  chatSettingsStore: ReturnType<typeof useChatSettingsStore>,
  translatorStore: ReturnType<typeof useTranslatorStore>
) {
  const translatedText = ref<string | null>(null)

  const isThisMessageTranslating = computed(() => {
    return (
      translatorStore.isMessageTranslating &&
      translatorStore.translatingMessageId ===
        message.value.id
    )
  })

  const isOtherMessageTranslating = computed(() => {
    return (
      translatorStore.isMessageTranslating &&
      translatorStore.translatingMessageId !==
        message.value.id
    )
  })

  const translateMessage = async () => {
    if (isOtherMessageTranslating.value) {
      return
    }

    if (isThisMessageTranslating.value) {
      return
    }

    // 이미 번역된 경우 번역 결과 닫기
    if (translatedText.value) {
      clearTranslation()
      return
    }

    const text = message.value.content.trim()

    if (!text) {
      return
    }

    try {
      const targetLanguage =
        chatSettingsStore.messageTranslateLanguage

      const result =
        await translatorStore.translateMessage(
          message.value.id,
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

  const clearTranslation = () => {
    translatedText.value = null

    // window.speechSynthesis.cancel()
  }

  return {
    translatedText,
    isThisMessageTranslating,
    isOtherMessageTranslating,
    translateMessage,
    clearTranslation
  }
}