import type { useChatSettingsStore } from '@/chat/store/ChatSettingsStore'

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

export function useMessageSpeech(
  chatSettingsStore: ReturnType<typeof useChatSettingsStore>
) {
  // =====================================================
  // 음성 중지
  // =====================================================

  const stopSpeech = () => {
    window.speechSynthesis.cancel()
  }

  // =====================================================
  // 원본 메시지 음성 언어
  // =====================================================

  const getOriginalSpeechLanguage = () => {
    const language =
      chatSettingsStore.originalVoiceLanguage

    if (language === 'auto') {
      return navigator.language
    }

    return speechLanguages[language] ?? 'en-US'
  }

  // =====================================================
  // 원본 메시지 음성 재생
  // =====================================================

  const speakOriginal = (text: string) => {
    const content = text.trim()

    if (!content) {
      return
    }

    stopSpeech()

    const utterance =
      new SpeechSynthesisUtterance(content)

    utterance.lang =
      getOriginalSpeechLanguage()

    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    window.speechSynthesis.speak(utterance)
  }

  // =====================================================
  // 번역 메시지 음성 언어
  // =====================================================

  const getTranslationSpeechLanguage = () => {
    const language =
      chatSettingsStore.translatedVoiceLanguage

    return speechLanguages[language] ?? 'en-US'
  }

  // =====================================================
  // 번역 메시지 음성 재생
  // =====================================================

  const speakTranslated = (text: string | null) => {
    if (!text?.trim()) {
      return
    }

    stopSpeech()

    const utterance =
      new SpeechSynthesisUtterance(
        text
      )

    utterance.lang =
      getTranslationSpeechLanguage()

    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    window.speechSynthesis.speak(
      utterance
    )
  }

  return {
    speakOriginal,
    speakTranslated,
    stopSpeech
  }
}