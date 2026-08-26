<script setup lang="ts">

import { ref, computed } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useAuthStore } from '@/shared/auth/AuthStore'

const uiStore = useUIStore()
const authStore = useAuthStore()




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
        📢 광고보기
      </span>

      <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" :class="uiStore.currentTab === 'findPeople'
        ? 'text-yellow-400 bg-neutral-700 rounded'
        : 'text-neutral-300'" @click="uiStore.changeTab('findPeople')">
        🔍 사람찾기
      </span>

      <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" :class="uiStore.currentTab === 'notice'
        ? 'text-yellow-400 bg-neutral-700 rounded'
        : 'text-neutral-300'" @click="uiStore.changeTab('notice')">
        📢 공지사항
      </span>
    </div>
    <div class="flex items-center gap-3 text-[10px]">
      <button @click="logout()"
        class="border border-neutral-500 px-2 py-0.5 bg-[#423f3a] text-neutral-300 hover:text-white hover:bg-neutral-700">로그아웃</button>
    </div>
  </header>



</template>


<style scoped>
/* Silkscreen 폰트 불러오기 */
@import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');

.font-silkscreen {
  font-family: 'Silkscreen', cursive, sans-serif;
  /* 픽셀 도트 질감 살리기 */
  -webkit-font-smoothing: none;
  font-smooth: never;
}
</style>