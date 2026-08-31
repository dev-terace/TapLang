<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  searchQuery: string
  isInviteMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'add-friend'): void
  (e: 'start-invite'): void
  (e: 'cancel-invite'): void
  (e: 'complete-invite'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="bg-[#c5bfb6] px-3 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center gap-2 shrink-0">
    <!-- 검색창 -->
    <div class="flex-1 relative">
      <input 
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text" 
        :placeholder="t('friend-sidebar-header.searchPlaceholder')" 
        class="w-full bg-[#fbf9f5] border-2 border-[#2d2b28] text-xs px-2 py-1 font-bold text-[#2d2b28] placeholder-[#a39f98] focus:outline-none focus:bg-white transition-colors shadow-[inset_1px_1px_0px_0px_rgba(0,0,0,0.1)]"
        :disabled="isInviteMode"
      />
    </div>

    <!-- 기본 상태 버튼 -->
    <div v-if="!isInviteMode" class="flex gap-1 shrink-0">
      <button 
        @click="emit('add-friend')"
        class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-1 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap"
      >
        {{ t('friend-sidebar-header.addFriend') }}
      </button>
      <button 
        @click="emit('start-invite')"
        class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-1 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap"
      >
        {{ t('friend-sidebar-header.invite') }}
      </button>
    </div>

    <!-- 초대 모드 상태 버튼 -->
    <div v-else class="flex gap-1 shrink-0">
      <button 
        @click="emit('cancel-invite')"
        class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-1 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap"
      >
        {{ t('friend-sidebar-header.cancel') }}
      </button>
      <button 
        @click="emit('complete-invite')"
        class="bg-amber-400 hover:bg-amber-500 text-[#2d2b28] border-2 border-[#2d2b28] text-[10px] px-2 py-1 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap"
      >
        {{ t('friend-sidebar-header.completeInvite') }}
      </button>
    </div>
  </div>
</template>