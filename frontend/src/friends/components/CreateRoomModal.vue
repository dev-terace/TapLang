<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/shared/ui/UiStore'

const props = defineProps<{
  isOpen: boolean
  friendNames: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', roomName: string): void
}>()

const { t } = useI18n()
const uiStore = useUIStore()
const roomNameInput = ref('')

// 모달이 열릴 때마다 기본 채팅방 이름 설정 (최대 4명)
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.friendNames.length <= 4) {
      roomNameInput.value = props.friendNames.join(', ')
    } else {
      roomNameInput.value = props.friendNames.slice(0, 4).join(', ') + ' ...'
    }
  }
})

const handleConfirm = () => {
  if (!roomNameInput.value.trim()) {
    alert(t('create-room-modal.emptyRoomNameAlert'))
    return
  }
  
  // 입력된 채팅방 이름을 uiStore에 저장
  uiStore.roomName = roomNameInput.value
  
  emit('confirm', roomNameInput.value)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
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
        <span>{{ t('create-room-modal.title') }}</span>

        <button
          class="hover:text-red-400 font-pixel text-lg leading-none"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <!-- 본문 영역 -->
      <div class="p-5 space-y-4">
        <p class="text-xs font-bold uppercase text-neutral-500">
          {{ t('create-room-modal.subtitle') }}
        </p>

        <!-- 채팅방 이름 입력 -->
        <div>
          <label class="block text-xs font-bold mb-1">
            {{ t('create-room-modal.roomNameLabel') }}
          </label>

          <input
            type="text"
            v-model="roomNameInput"
            :placeholder="t('create-room-modal.placeholder')"
            class="w-full bg-white
                   border-2 border-[#2d2b28]
                   p-2 text-xs
                   outline-none
                   shadow-inner"
            @keyup.enter="handleConfirm"
          />
        </div>

        <!-- 버튼 -->
        <div class="mt-6 flex justify-end gap-3 text-xs">
          <button
            @click="emit('close')"
            class="bg-[#c5bfb6]
                   text-[#2d2b28]
                   border-2 border-[#2d2b28]
                   px-4 py-1.5
                   font-bold
                   hover:bg-neutral-300
                   transition-all"
          >
            {{ t('create-room-modal.cancel') }}
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
            {{ t('create-room-modal.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>