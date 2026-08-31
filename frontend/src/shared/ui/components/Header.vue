<script setup lang="ts">
import { ref, computed, watch } from 'vue' // watch 추가
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/shared/ui/UiStore'
import { useAuthStore } from '@/shared/auth/AuthStore'

const uiStore = useUIStore()
const authStore = useAuthStore()

// i18n 인스턴스 불러오기
const { t, locale } = useI18n()

// ✨ 언어가 변경될 때마다 localStorage에 저장
watch(locale, (newLocale) => {
  localStorage.setItem('user-locale', newLocale as string)
})

const logout = () => {
  authStore.logout()
  uiStore.currentTab = 'chat'
}
</script>

<template>
  <header
    class="h-10 bg-[#2d2b28] text-[#fbf9f5] flex items-center justify-between px-4 border-b-2 border-[#2d2b28] shrink-0">
    <div class="flex items-center gap-6 text-xs tracking-widest font-bold">
      <h1
        class="font-silkscreen text-base md:text-lg font-bold tracking-widest text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] select-none">
        TapLang
      </h1>
      <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" :class="uiStore.currentTab === 'ad'
        ? 'text-yellow-400 bg-neutral-700 rounded'
        : 'text-neutral-300'" @click="uiStore.changeTab('ad')">
        {{ t('header.ad') }}
      </span>

      <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" :class="uiStore.currentTab === 'findPeople'
        ? 'text-yellow-400 bg-neutral-700 rounded'
        : 'text-neutral-300'" @click="uiStore.changeTab('findPeople')">
        {{ t('header.findPeople') }}
      </span>

      <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" :class="uiStore.currentTab === 'notice'
        ? 'text-yellow-400 bg-neutral-700 rounded'
        : 'text-neutral-300'" @click="uiStore.changeTab('notice')">
        {{ t('header.notice') }}
      </span>
    </div>

    <div class="flex items-center gap-3 text-[10px]">
      <!-- 언어 선택 드롭다운 -->
      <select 
        v-model="locale" 
        class="bg-[#423f3a] text-neutral-300 border border-neutral-500 px-1 py-0.5 rounded cursor-pointer outline-none focus:border-yellow-400"
      >
        <option value="ko">KR</option>
        <option value="en">EN</option>
      </select>

      <button @click="logout()"
        class="border border-neutral-500 px-2 py-0.5 bg-[#423f3a] text-neutral-300 hover:text-white hover:bg-neutral-700">
        {{ t('header.logout') }}
      </button>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');

.font-silkscreen {
  font-family: 'Silkscreen', cursive, sans-serif;
  -webkit-font-smoothing: none;
  font-smooth: never;
}
</style>