<script setup lang="ts">

import { ref } from 'vue'
import { useFriendStore } from '../stores/FriendStore'
import { useModalStore } from '../stores/ModalStore'


const friendStore = useFriendStore()
const modalStore = useModalStore()


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
</template>