<script setup lang="ts">
import { useUIStore } from '@/stores/UiStore'

const uiStore = useUIStore()
</script>

<template>
  <footer
    class="h-14 bg-[#dfdad1] border-t-4 border-[#2d2b28] flex items-center px-4 shrink-0 overflow-x-auto gap-3"
  >
    <button
      class="bg-[#2d2b28] text-yellow-400 font-bold px-3 py-1.5 text-xs flex items-center gap-2 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#a39b90] shrink-0 mr-2"
      @click="uiStore.changeTab('settings')"
    >
      <span class="font-pixel text-base">⚙️</span>
      <span>설정</span>
    </button>

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
        uiStore.currentTab === 'groupChat'
          ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-red-700'
          : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]'
      ]"
      @click="uiStore.changeTab('groupChat')"
    >
      <span class="font-pixel text-lg">🌐</span>
      <span>그룹 채팅방</span>
    </button>

    <button
      :class="[
        'px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0',
        uiStore.currentTab === 'transTag'
          ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-emerald-700'
          : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]'
      ]"
      @click="uiStore.changeTab('transTag')"
    >
      <span class="font-pixel text-lg">🏷️</span>
      <span>번역 태그 등록</span>
    </button>
  </footer>
</template>

