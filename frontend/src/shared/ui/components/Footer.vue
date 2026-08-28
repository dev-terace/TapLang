<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'

const uiStore = useUIStore()



</script>

<template>
  <footer
    class="h-14 bg-[#dfdad1] border-t-4 border-[#2d2b28] flex items-center px-4 shrink-0 overflow-x-auto gap-3"
  >


    <button
      :class="[
        'px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0',
        uiStore.currentTab === 'chat'
          ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-blue-700'
          : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]'
      ]"
      @click="uiStore.changeTab('chat')"
    >
      <span class="font-pixel text-lg">💬</span>
      <span>채팅방</span>
    </button>

    <button
      :class="[
        'px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0',
        uiStore.currentTab === 'customChat'
          ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-red-700'
          : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]'
      ]"
      @click="uiStore.changeTab('customChat')"
    >
      <span class="font-pixel text-lg">🌐</span>
      <span>그룹 채팅방</span>
    </button>

    <button
      :class="[
        'px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0',
        uiStore.currentTab === 'quiz'
          ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-emerald-700'
          : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]'
      ]"
      @click="uiStore.changeTab('quiz')"
    >
      <span class="font-pixel text-lg">⁉️</span>
      <span>퀴즈 맞추기</span>
    </button>
  </footer>
</template>

