import { useTranslatorStore } from '../../store/AiTransStore.js'
import { useChatSettingsStore } from '../../store/ChatSettingsStore.js'
import axios from "axios"
export function useChatTranslate() {
  const translatorStore = useTranslatorStore()
  const chatSettingsStore = useChatSettingsStore()

  const translate = async (
    text: string
  ): Promise<string | null> => {

    const trimmed = text.trim()

    if (!trimmed) {
      return null
    }

    try {

      const sourceLanguage =
        chatSettingsStore.chatSourceLanguage

      const targetLanguage =
        chatSettingsStore.chatTargetLanguage

      const result =
        await translatorStore.translateInput(
          `${sourceLanguage}<->${targetLanguage}`,
          trimmed
        )

      if (result === false) {
        alert('번역할 수 없는 내용입니다.')
        return null
      }

      return result?.translatedText ?? null

    } catch (error) {

      console.error(
        'AI 번역 실패:',
        error
      )

      // 번역 API Rate Limit
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 429
      ) {
        alert(
          '번역 요청이 너무 많습니다.\n잠시 후 다시 시도해주세요.'
        )

        return null
      }

      alert('AI 번역에 실패했습니다.')

      return null
    }
  }

  return {
    translate
  }
}