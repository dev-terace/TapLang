<script setup lang="ts">

import { ref, computed } from 'vue'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import FriendModal from './FriendModal.vue'
import CountryModal from './CountryModal.vue'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import {useChatStore} from "@/chat/store/ChatRoom.js"
import { useUIStore } from '@/shared/ui/UiStore.js'
const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const alertFunc = (msg: string) => {
  alert(msg)
}



// 내 프로필 + 온라인 친구 목록
const onlineList = computed(() => {
  if (!authStore.userInfo) return [];

  return [
    {
      id: authStore.userInfo.id,
      name: authStore.userInfo.name,
      flag: authStore.userInfo.flag,
      statusMsg: authStore.userInfo.statusMsg,
      online: true,
      isMe: true
    },

    ...friendStore.onlineFriends.map(friend => ({
      ...friend,
      isMe:false
    }))
  ];
});

const reqFriends = computed(() => friendStore.reqFriends);


console.log("friendList.vue : ", reqFriends);


</script>

<template>



  <section class="w-full lg:w-80 bg-[#dfdad1] lg:border-r-4 border-b-4 lg:border-b-0 border-[#2d2b28] flex flex-col shrink-0">
    
    
    <!-- 주소록 헤더 -->


    <div class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center">
      <span class="text-xs font-bold tracking-wider">// 인맥_주소록.sh</span>
      <button 
       @click="modalStore.openModal('addFriend')"
        class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-0.5 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        + 등록
      </button>
    </div>

    <!-- 친구 목록 영역 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      

          <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-6 mb-2">
      ● 친구 요청
    </div>

    <!-- 친구 요청 리스트 -->
    <div
      v-for="friend in reqFriends"
      :key="friend.id"
      class="group flex items-center gap-3 p-2 bg-[#f4f1eb] hover:bg-[#5c5851] hover:text-[#fbf9f5] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28]"
    >
      <!-- 아바타 -->
      <div
        class="w-8 h-8 bg-[#2d2b28] flex items-center justify-center border-2 border-[#2d2b28] shrink-0"
      >
        <img
          :src="`https://flagcdn.com/w40/${friend.flag}.png`"
          alt=""
          class="w-5 h-3.5 object-cover border border-[#2d2b28]"
        />
      </div>

      <!-- 이름 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-yellow-500 inline-block rounded-full"></span>
          <span class="text-xs font-bold truncate">
            {{ friend.name }}
          </span>
        </div>
        <div class="text-[10px] text-neutral-500 group-hover:text-neutral-300 truncate mt-0.5">
          친구 요청 대기중
        </div>
      </div>

      <div class="flex gap-1">
        <button
          class="bg-amber-500 text-white border-2 border-[#2d2b28] text-[10px] px-2 py-0.5 font-bold hover:bg-amber-600 transition-colors"
          
        >
          요청 취소
        </button>
      </div>
    </div>


      <!-- ● 온라인 인맥 타이틀 -->
      <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-2">
        ● 온라인 인맥
      </div>
      


      <div 
        v-for="friend in onlineList" 
        :key="friend.id" 
        @dblclick="!friend.isMe && friend.id && uiStore.changeChatRoomTab(true, [friend.id], friend.name)"

        class="group flex items-center gap-3 p-2 bg-[#f4f1eb] hover:bg-[#5c5851] hover:text-[#fbf9f5] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] cursor-pointer transition-all"
      >
        <!-- 아바타 (호버 시 색상 반전) -->
      <div
        @click.stop="friend.isMe && modalStore.openModal('selectCountry')"
        class="group/avatar relative w-8 h-8 bg-[#2d2b28] flex items-center justify-center border-2 border-[#2d2b28] shrink-0 font-pixel text-lg select-none transition-colors"
        :class="friend.isMe ? 'cursor-pointer hover:bg-[#5c5851]' : ''"
      >
        <span
          class="transition-opacity"
          :class="friend.isMe ? 'group-hover/avatar:opacity-30' : ''"
        >
            <img 
            :src="`https://flagcdn.com/w40/${friend.isMe ? friend.flag : 'kr'}.png`"
            alt=""
            class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"/>
        </span>

        <span
          v-if="friend.isMe"
          class="absolute inset-0 hidden group-hover/avatar:flex items-center justify-center text-white text-lg font-bold pointer-events-none"
        >
          +
        </span>
      </div>
        
        <!-- 이름 및 상태메시지 -->
        <div v-if ="authStore.userInfo" class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-emerald-500 inline-block rounded-full"></span>
            <span class="text-xs font-bold truncate tracking-tight">{{ friend.name  }}</span>
          </div>
          <div class="text-[10px] text-neutral-500 group-hover:text-neutral-300 truncate mt-0.5">
            {{ friend.statusMsg }}
          </div>
        </div>

        
      </div>

      <!-- ○ 오프라인 인맥 타이틀 -->
      <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-6 mb-2">
        ○ 오프라인 인맥
      </div>
      
      <!-- 오프라인 친구 리스트 -->
      <div 
        v-for="friend in friendStore.offlineFriends" 
        :key="friend.id" 
        class="flex items-center gap-3 p-2 bg-[#dfdad1] opacity-60 border-2 border-transparent"
      >
        <!-- 아바타 (비활성화 필터) -->
        <div class="w-8 h-8 bg-neutral-400 text-neutral-200 flex items-center justify-center shrink-0 font-pixel text-lg filter grayscale">
          <img 
            :src="`https://flagcdn.com/w40/${'kr'}.png`"
            alt=""
            class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"/>
        </div>
        
        <!-- 이름 및 상태메시지 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-neutral-400 inline-block rounded-full"></span>
            <span class="text-xs font-bold text-[#5c5851] truncate">{{ friend.name }}</span>
          </div>
          <div class="text-[10px] text-neutral-500 truncate mt-0.5">
            {{ friend.statusMsg }}
          </div>
        </div>
      </div>
      </div>
      
    

    <FriendModal/>
    <CountryModal/>
  

  </section>

  
    

  
</template>


