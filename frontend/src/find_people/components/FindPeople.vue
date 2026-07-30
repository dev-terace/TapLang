<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import {ref} from 'vue'

const uiStore = useUIStore();

interface User {
  
  name: string
  avatar: string
  role: string
}

const dummyUsers = ref<User[]>([
  {
    name: '사이버_드리프터',
    avatar: '🪐',
    role: '네트워크 노드 분석가'
  },
  {
    name: '테크노_스타일',
    avatar: '🕶️',
    role: '오픈 테크니션'
  }
])

const alertFunc = (msg: string) => {
  alert(msg);
};

</script>



<template>
              <div v-if="uiStore.currentTab === 'findPeople'" class="flex-1 overflow-y-auto p-6">
            <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
              <h3 class="font-bold text-base tracking-wider">// 사람찾기_디렉토리.net</h3>
              <p class="text-[10px] text-neutral-500">글로벌 서버의 접속자를 탐색합니다.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="user in dummyUsers" :key="user.name" class="p-3 bg-[#f4f1eb] border-2 border-[#2d2b28] flex justify-between items-center shadow-[3px_3px_0px_0px_#2d2b28]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#2d2b28] text-white flex items-center justify-center font-pixel text-lg border-2 border-[#2d2b28]">{{ user.avatar }}</div>
                  <div>
                    <div class="text-xs font-bold">{{ user.name }}</div>
                    <div class="text-[9px] text-neutral-500">{{ user.role }}</div>
                  </div>
                </div>
                <button @click="alertFunc('초대 메일을 발송했습니다.')" class="border-2 border-[#2d2b28] bg-white text-[10px] px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all">연결</button>
              </div>
            </div>
          </div>

</template>