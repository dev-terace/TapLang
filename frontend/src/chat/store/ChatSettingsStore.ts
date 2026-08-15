import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ChatSettingsApi } from '../api/chatSettings.api'

export interface TranslatorLanguage {
  code: string
  name: string
  nativeName: string
}

export interface ChatSettings {
  chatSourceLanguage: string
  chatTargetLanguage: string
  messageTranslateLanguage: string
  originalVoiceLanguage: string
  translatedVoiceLanguage: string
}

export const useChatSettingsStore = defineStore(
  'chatSettings',
  () => {

    // =====================================================
    // 언어 목록
    // =====================================================

    const languages = ref<TranslatorLanguage[]>([
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어'
      },
      {
        code: 'en',
        name: 'English',
        nativeName: 'English'
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語'
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文'
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español'
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français'
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch'
      },
      {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano'
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português'
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский'
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية'
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी'
      }
    ])


    // =====================================================
    // 설정
    // =====================================================

    const chatSourceLanguage = ref('ko')
    const chatTargetLanguage = ref('en')

    const messageTranslateLanguage = ref('ko')

    const originalVoiceLanguage = ref('auto')
    const translatedVoiceLanguage = ref('ko')


    // =====================================================
    // 로딩 상태
    // =====================================================

    const isLoading = ref(false)


    // =====================================================
    // 서버에서 설정 불러오기
    // =====================================================

    const loadChatSettings = async () => {

      try {

        isLoading.value = true

        const settings =
          await ChatSettingsApi.getChatSettings()

        chatSourceLanguage.value =
          settings.chatSourceLanguage

        chatTargetLanguage.value =
          settings.chatTargetLanguage

        messageTranslateLanguage.value =
          settings.messageTranslateLanguage

        originalVoiceLanguage.value =
          settings.originalVoiceLanguage

        translatedVoiceLanguage.value =
          settings.translatedVoiceLanguage

      } catch (error) {

        console.error(
          'loadChatSettings error:',
          error
        )

      } finally {

        isLoading.value = false

      }

    }


    // =====================================================
    // 설정 저장
    // =====================================================

    const saveChatSettings = async () => {

      try {

        isLoading.value = true

        const settings =
          await ChatSettingsApi.updateChatSettings({

            chatSourceLanguage:
              chatSourceLanguage.value,

            chatTargetLanguage:
              chatTargetLanguage.value,

            messageTranslateLanguage:
              messageTranslateLanguage.value,

            originalVoiceLanguage:
              originalVoiceLanguage.value,

            translatedVoiceLanguage:
              translatedVoiceLanguage.value

          })


        // 서버에서 반환된 값 반영

        chatSourceLanguage.value =
          settings.chatSourceLanguage

        chatTargetLanguage.value =
          settings.chatTargetLanguage

        messageTranslateLanguage.value =
          settings.messageTranslateLanguage

        originalVoiceLanguage.value =
          settings.originalVoiceLanguage

        translatedVoiceLanguage.value =
          settings.translatedVoiceLanguage


        return settings

      } catch (error) {

        console.error(
          'saveChatSettings error:',
          error
        )

        throw error

      } finally {

        isLoading.value = false

      }

    }


    // =====================================================
    // 반환
    // =====================================================

    return {

      languages,

      chatSourceLanguage,
      chatTargetLanguage,

      messageTranslateLanguage,

      originalVoiceLanguage,
      translatedVoiceLanguage,

      isLoading,

      loadChatSettings,
      saveChatSettings

    }

  }
)