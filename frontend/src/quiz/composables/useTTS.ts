import { ref } from 'vue'

export interface TranslatorLanguage {
  code: string
  name: string
  nativeName: string
}

export const languages: TranslatorLanguage[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
]

const langLocaleMap: Record<string, string> = {
  ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN',
  es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
  pt: 'pt-PT', ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN'
}

export function useTTS() {
  const selectedTtsLang = ref<string>('en')
  const isPlaying = ref(false)
  const barHeights = ref([20, 28, 14, 34, 18])
  let animInterval: number | null = null

  const animateBars = (active: boolean) => {
    if (animInterval) { clearInterval(animInterval); animInterval = null; }
    if (active) {
      animInterval = window.setInterval(() => {
        barHeights.value = barHeights.value.map(() => 12 + Math.random() * 28)
      }, 80)
    } else {
      barHeights.value = [20, 28, 14, 34, 18]
    }
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
      return
    }
    if (!text) return

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = langLocaleMap[selectedTtsLang.value] || 'en-US'
    utter.rate = 0.95

    window.speechSynthesis.cancel()
    isPlaying.value = true
    animateBars(true)

    utter.onend = () => { isPlaying.value = false; animateBars(false) }
    utter.onerror = () => { isPlaying.value = false; animateBars(false) }

    window.speechSynthesis.speak(utter)
  }

  return {
    languages,
    selectedTtsLang,
    isPlaying,
    barHeights,
    speak
  }
}