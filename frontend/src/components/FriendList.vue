<script setup lang="ts">

import { ref } from 'vue'
import { useFriendStore } from '../stores/FriendStore'
import { useModalStore } from '../stores/ModalStore'


const friendStore = useFriendStore()
const modalStore = useModalStore()

// 기존에 사용하시던 모달 및 알림 함수 연동을 위한 임시 정의
const openModal = (action: string) => {
  console.log(`${action} 모달 오픈`)
  // 부모 컴포넌트의 이벤트나 모달 스토어를 호출하는 로직을 여기에 넣으시면 됩니다.
}

const alertFunc = (msg: string) => {
  alert(msg)
}

const friendFormData = ref({
  name: '',
  status: ''
})

const handleAddFriend = () => {
  friendStore.addFriend({
    name: friendFormData.value.name,
    statusMsg: friendFormData.value.status
  })

  friendFormData.value = {
    name: '',
    status: ''
  }

  modalStore.closeModal()
}

const closeModal = () => {
  modalStore.closeModal()
}


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
      
      <!-- ● 온라인 인맥 타이틀 -->
      <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-2">
        ● 온라인 인맥
      </div>
      
      <!-- 온라인 친구 리스트 -->
      <div 
        v-for="friend in friendStore.onlineFriends" 
        :key="friend.id" 
        @dblclick="alertFunc(friend.name + ' 님에게 귓속말을 보냅니다.')"
        class="group flex items-center gap-3 p-2 bg-[#f4f1eb] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] cursor-pointer transition-all"
      >
        <!-- 아바타 (호버 시 색상 반전) -->
        <div class="w-8 h-8 bg-[#2d2b28] group-hover:bg-[#fbf9f5] flex items-center justify-center border-2 border-[#2d2b28] shrink-0 font-pixel text-lg select-none">
          {{ friend.avatar }}
        </div>
        
        <!-- 이름 및 상태메시지 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-emerald-500 inline-block rounded-full"></span>
            <span class="text-xs font-bold truncate tracking-tight">{{ friend.name }}</span>
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
          {{ friend.avatar }}
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



      <div  v-if="modalStore.activeModal === 'addFriend'" class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50" @click.self="closeModal">
    <div class="w-full max-w-sm bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[8px_8px_0px_0px_#121315] overflow-hidden">
      
      <div class="bg-[#2d2b28] text-[#fbf9f5] px-4 py-1.5 flex justify-between items-center text-xs font-bold">
        <span>// 데이터_보안_엔트리.cfg</span>
        <button class="hover:text-red-400 font-pixel text-lg leading-none" @click="closeModal">×</button>
      </div>

      <div class="p-5 space-y-4">
        <p class="text-xs font-bold uppercase text-neutral-500">// 신규 인맥 텔레메트리 등록</p>
        <div>
          <label class="block text-xs font-bold mb-1">식별 성명 :</label>
          <input type="text" v-model="friendFormData.name" placeholder="예: 미래소년" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">상태 전파 메시지 :</label>
          <input type="text" v-model="friendFormData.status" placeholder="현재 노드 기분 상태 기입" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
        </div>
        <div class="mt-6 flex justify-end gap-3 text-xs">
          <button @click="closeModal" class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-300 transition-all">
            취소
          </button>
          <button @click="handleAddFriend" class="bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_0px_#a39b90]">
            프로세스 적용
          </button>
        </div>
      </div>
    </div>
  </div>

  </section>

  
    

  
</template>


