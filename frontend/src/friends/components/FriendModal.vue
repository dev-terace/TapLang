<script setup lang="ts">
import { ref } from 'vue'
import { useFriendStore } from '@/friends/stores/FriendStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import { useAuthStore } from '@/shared/auth/AuthStore'

const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()

const friendFormData = ref({
  name: ''
})


const handleReqFriend = async () => {
  try {
    await friendStore.addFriendRequest({
      searchName: friendFormData.value.name
    })

    modalStore.closeModal()
  } catch (error) {
    
  }
}

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<template>
  <div
    v-if="modalStore.activeModal === 'addFriend'"
    class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
  >
    <div
      class="w-full max-w-sm bg-[#e6e2db]
             border-4 border-[#2d2b28]
             shadow-[8px_8px_0px_0px_#121315]
             overflow-hidden"
    >

      <!-- 헤더 -->
      <div
        class="bg-[#2d2b28] text-[#fbf9f5]
               px-4 py-1.5
               flex justify-between items-center
               text-xs font-bold"
      >
        <span>// 친구_요청_프로토콜.cfg</span>

        <button
          class="hover:text-red-400 font-pixel text-lg leading-none"
          @click="closeModal"
        >
          ×
        </button>
      </div>


      <div class="p-5 space-y-4">

        <p class="text-xs font-bold uppercase text-neutral-500">
          // 신규 인맥 검색
        </p>


        <!-- 친구 검색 -->
        <div>
          <label class="block text-xs font-bold mb-1">
            식별 성명 :
          </label>

          <input
            type="text"
            v-model="friendFormData.name"
            placeholder="예: human#0"
            class="w-full bg-white
                   border-2 border-[#2d2b28]
                   p-2 text-xs
                   outline-none
                   shadow-inner"
          />
        </div>


        <!-- 버튼 -->
        <div class="mt-6 flex justify-end gap-3 text-xs">

          <button
            @click="closeModal"
            class="bg-[#c5bfb6]
                   text-[#2d2b28]
                   border-2 border-[#2d2b28]
                   px-4 py-1.5
                   font-bold
                   hover:bg-neutral-300
                   transition-all"
          >
            닫기
          </button>


          <button
            @click="handleReqFriend"
            class="bg-[#2d2b28]
                   text-[#fbf9f5]
                   border-2 border-[#2d2b28]
                   px-4 py-1.5
                   font-bold
                   hover:bg-neutral-800
                   transition-all
                   shadow-[2px_2px_0px_0px_#a39b90]"
          >
            친구 요청
          </button>

        </div>

      </div>
    </div>

  </div>
</template>