

<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'

const uiStore = useUIStore();

</script>

<template>
  <div 
    v-if="uiStore.currentTab === 'memo'" 
    class="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col h-full"
  >
    <div class="flex items-center justify-between border-b-2 border-[#2d2b28] pb-2 mb-4">
      <span class="text-xs font-bold text-neutral-600">
        📝 메인_작업_메모장.txt
      </span>
    </div>

    <textarea
      class="flex-1 w-full bg-[#fbf9f5] text-[#2d2b28] border-2 border-dashed border-[#c5bfb6] p-4 text-xs font-mono leading-relaxed outline-none resize-none shadow-inner"
      placeholder="이곳은 개인 작업용 메모장 공간입니다..."
    ></textarea>
  </div>
</template>

         