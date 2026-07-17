<script setup lang="ts">
import { useUIStore } from '@/stores/UiStore'

const uiStore = useUIStore();

</script>

<template>
         <div v-if="uiStore.currentTab === 'chat'" class="flex-1 flex flex-col h-full bg-[#fbf9f5]">
            <div class="bg-[#e6e2db] p-3 border-b-2 border-[#2d2b28] flex justify-between items-center">
              <span class="font-bold text-xs">💬 채팅방</span>
              <span class="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded">현재 42명 접속 중</span>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div class="text-xs bg-white border-2 border-[#2d2b28] p-2 rounded max-w-md shadow-[2px_2px_0px_0px_#2d2b28]"><span class="font-bold text-blue-800">[시스템]</span> 공용 라운지에 입장하셨습니다. 매너 채팅 부탁드립니다.</div>
              <div class="text-xs bg-white border-2 border-[#2d2b28] p-2 rounded max-w-md shadow-[2px_2px_0px_0px_#2d2b28]"><span class="font-bold text-purple-800">[아날로그]</span> 다들 점심은 드셨나요?</div>
            </div>
            <div class="p-3 border-t-2 border-[#2d2b28] bg-[#f4f1eb] flex gap-2">
              <input type="text" placeholder="메시지를 입력하세요..." class="flex-1 bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none" />
              <button class="bg-[#2d2b28] text-[#fbf9f5] px-4 font-bold text-xs border-2 border-[#2d2b28]">전송</button>
            </div>
          </div>
</template>