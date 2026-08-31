import { useI18n } from 'vue-i18n' // i18n 추가
import { useTranslatorStore } from '../../store/AiTransStore.js'
import { useChatSettingsStore } from '../../store/ChatSettingsStore.js'
import axios from "axios"

export function useChatTranslate() {
  const { t } = useI18n() // t 함수 가져오기
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
        alert(t('use-chat-translate.untranslatable'))
        return null
      }

      return result?.translatedText ?? null

    } catch (error) {

      console.error(
        t('use-chat-translate.errorLog'),
        error
      )

      // 번역 API Rate Limit
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 429
      ) {
        alert(
          t('use-chat-translate.rateLimitAlert')
        )

        return null
      }

      alert(t('use-chat-translate.failAlert'))

      return null
    }
  }

  return {
    translate
  }
}