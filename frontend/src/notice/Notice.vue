<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'

const uiStore = useUIStore();

</script>

<template>
              <div v-if="uiStore.currentTab === 'notice'" class="flex-1 overflow-y-auto p-6">
            <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
              <h3 class="font-bold text-base tracking-wider">// 시스템_공지사항.sys</h3>
              <p class="text-[10px] text-neutral-500">서버 점검 및 일반 공지 목록입니다.</p>
            </div>
            <div class="space-y-3">
              <div class="bg-white border-2 border-[#2d2b28] p-3 text-xs flex justify-between items-center shadow-[2px_2px_0px_0px_#2d2b28]">
                <span class="font-bold text-red-600">[긴급] v3.1 클라이언트 업데이트 안내</span>
                <span class="text-[10px] text-neutral-400">2026-07-15</span>
              </div>
              <div class="bg-white border-2 border-[#2d2b28] p-3 text-xs flex justify-between items-center shadow-[2px_2px_0px_0px_#2d2b28]">
                <span class="font-bold">[안내] 사설 대화방 목록 기능 추가</span>
                <span class="text-[10px] text-neutral-400">2026-07-15</span>
              </div>
            </div>
          </div>
</template>