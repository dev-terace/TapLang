<script setup lang="ts">

import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/UiStore'


const uiStore = useUIStore()

const isLoggedIn = ref(false)


const logout = () => {
  isLoggedIn.value = false
  uiStore.currentTab = 'memo'
}

</script>

 <template>
<header class="h-10 bg-[#2d2b28] text-[#fbf9f5] flex items-center justify-between px-4 border-b-2 border-[#2d2b28] shrink-0">
      <div class="flex items-center gap-6 text-xs tracking-widest font-bold">
        <span class="text-yellow-400 font-pixel text-xl tracking-tighter">✦ TapLang</span>
        <span
        class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors"
        :class="uiStore.currentTab === 'memo' 
            ? 'text-yellow-400 bg-neutral-700 rounded' 
            : 'text-neutral-300'"
        @click="uiStore.changeTab('memo')"
        >
        📝 메모장
        </span>

        <span
        class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors"
        :class="uiStore.currentTab === 'findPeople' 
            ? 'text-yellow-400 bg-neutral-700 rounded' 
            : 'text-neutral-300'"
        @click="uiStore.changeTab('findPeople')"
        >
        🔍 사람찾기
        </span>

        <span
        class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors"
        :class="uiStore.currentTab === 'notice' 
            ? 'text-yellow-400 bg-neutral-700 rounded' 
            : 'text-neutral-300'"
        @click="uiStore.changeTab('notice')"
        >
        📢 공지사항
        </span>
      </div>
      <div class="flex items-center gap-3 text-[10px]">
        <button @click="logout" class="border border-neutral-500 px-2 py-0.5 bg-[#423f3a] text-neutral-300 hover:text-white hover:bg-neutral-700">로그아웃</button>
      </div>
    </header>



    </template>