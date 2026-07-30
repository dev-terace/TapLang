<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { computed} from 'vue'

const uiStore = useUIStore();


 const isTopTab = computed(() => ['memo', 'findPeople', 'notice'].includes(uiStore.currentTab ));
</script>

<template>
          <div class="border-b-2 border-[#2d2b28] px-4 py-2 bg-[#f4f1eb] flex justify-between items-center text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-[#2d2b28] uppercase tracking-wider">// VIEWPORT: {{ uiStore.currentTab }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full border border-[#2d2b28]" :class="isTopTab ? 'bg-green-400' : 'bg-neutral-300'"></span>
              <span class="w-2.5 h-2.5 rounded-full border border-[#2d2b28]" :class="!isTopTab ? 'bg-blue-400' : 'bg-neutral-300'"></span>
            </div>
          </div>
</template>
          