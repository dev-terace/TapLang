import { createI18n } from 'vue-i18n'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

// 1. 저장된 언어가 있으면 가져오고, 없으면 브라우저 언어(en/ko) 감지 (기본값: ko)
const savedLanguage = localStorage.getItem('user-locale')
const browserLanguage = navigator.language.startsWith('en') ? 'en' : 'ko'
const initialLocale = savedLanguage || browserLanguage

const i18n = createI18n({
  legacy: false, // Composition API 사용
  locale: initialLocale, // 동적 언어 설정 (기존 'ko' 고정 수정)
  fallbackLocale: 'en',
  globalInjection: true, // 전역 템플릿 참조 활성화
  messages: { ko, en }
})

export default i18n