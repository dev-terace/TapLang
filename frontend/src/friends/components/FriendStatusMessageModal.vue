<script setup lang="ts">
import { ref } from 'vue'
// import { useFriendStore } from '@/friends/stores/FriendStore' // 필요시 스토어 임포트
import { useModalStore } from '@/shared/modal/ModalStore'
import { useFriendStore } from '../stores/FriendStore'
import { useAuthStore } from '@/shared/auth/AuthStore'
const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()

// 입력받을 상태 메시지 데이터
const statusFormData = ref({
  message: ''
})

const handleConfirm = async () => {
  try {
    // TODO: 스토어의 상태 메시지 업데이트 API 호출 로직 연결
    const userInfo = authStore.userInfo

    if (!userInfo) {
      console.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    await friendStore.updateStatusMessage({
      message: statusFormData.value.message
    })
    
    await authStore.syncAndAssignUser({
            provider: 'clerk',
            email: userInfo.email,
            name: userInfo.name,
    })
   
    modalStore.closeModal()
    
    // 모달이 닫힌 후 입력창 초기화가 필요하다면 아래 주석 해제
    statusFormData.value.message = ''
  } catch (error) {
    console.error('상태 메시지 업데이트 실패:', error)
  }
}

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<template>
  <!-- activeModal 이름은 실제 사용하시는 이름('editStatus' 등)으로 맞춰서 변경해주세요 -->
  <div
    v-if="modalStore.activeModal === 'updateStatus'"
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
        <span>// 상태메시지_변경_프로토콜.cfg</span>

        <button
          class="hover:text-red-400 font-pixel text-lg leading-none"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <div class="p-5 space-y-4">


        <!-- 상태 메시지 입력 -->
        <div>
          <label class="block text-xs font-bold mb-1">
            상태 메시지 :
          </label>

          <input
            type="text"
            v-model="statusFormData.message"
            placeholder="예: 오늘 하루도 화이팅!"
            @keyup.enter="handleConfirm"
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
            취소
          </button>

          <button
            @click="handleConfirm"
            class="bg-[#2d2b28]
                   text-[#fbf9f5]
                   border-2 border-[#2d2b28]
                   px-4 py-1.5
                   font-bold
                   hover:bg-neutral-800
                   transition-all
                   shadow-[2px_2px_0px_0px_#a39b90]"
          >
            확인
          </button>

        </div>

      </div>
    </div>
  </div>
</template>