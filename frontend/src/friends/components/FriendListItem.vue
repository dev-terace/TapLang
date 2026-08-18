<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  friend: { id: string, name: string, flag?: string, statusMsg?: string, isMe?: boolean }
  isOffline?: boolean
  isInviteMode: boolean
  isSelected: boolean
  isActiveMenu: boolean
  isBlocked?: boolean // 차단 여부 prop 추가
  isMyOnlineStatus: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-menu', id: string): void
  (e: 'toggle-select', id: string): void
  (e: 'double-click', friend: any): void
  (e: 'menu-action', action: string, friendId: string): void
  (e: 'open-country-modal'): void
}>()

const handleClick = () => {
  if (props.isInviteMode && !props.friend.isMe) {
    emit('toggle-select', props.friend.id)
  } else {
    emit('toggle-menu', props.friend.id)
  }
}

// 오프라인/온라인 상태에 따른 컨테이너 클래스 계산
const containerClass = computed(() => {
  if (props.isOffline) {
    return [
      'border-2 border-transparent transition-all bg-[#d1cbc1] opacity-70 hover:opacity-100 hover:border-[#2d2b28] hover:shadow-[3px_3px_0px_0px_#2d2b28] overflow-hidden',
      props.isActiveMenu ? 'opacity-100 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] !bg-[#f4f1eb]' : ''
    ]
  }
  return [
    'border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] transition-all bg-[#f4f1eb] overflow-hidden',
    props.isActiveMenu ? 'ring-1 ring-[#2d2b28]' : ''
  ]
})
</script>

<template>
  <div :class="containerClass">
    <div 
      @click="handleClick"
      @dblclick="!friend.isMe && !isInviteMode && emit('double-click', friend)"
      class="group flex items-center gap-2.5 p-2 cursor-pointer transition-colors relative"
      :class="isActiveMenu ? 'bg-[#3d3a36] text-[#fbf9f5]' : (isOffline ? 'hover:bg-[#e8e3d8] text-[#5c5851]' : 'hover:bg-[#e8e3d8] text-[#2d2b28]')"
    >
      <!-- 초대용 레트로 커스텀 라디오 버튼 -->
      <div v-if="isInviteMode && !friend.isMe" 
           class="w-4 h-4 rounded-full border-2 border-[#2d2b28] flex items-center justify-center bg-[#fbf9f5] shrink-0">
        <div v-if="isSelected" class="w-2 h-2 rounded-full bg-[#2d2b28]"></div>
      </div>

      <!-- 아바타 -->
      <div
        @click.stop="friend.isMe && emit('open-country-modal')"
        class="group/avatar relative w-7 h-7 flex items-center justify-center border border-[#2d2b28] shrink-0 font-pixel text-lg select-none transition-colors"
        :class="[
          isOffline ? 'bg-neutral-400 text-neutral-200 filter grayscale group-hover:grayscale-0' : 'bg-[#2d2b28]',
          friend.isMe ? 'cursor-pointer hover:bg-[#5c5851]' : ''
        ]"
      >
        <span class="transition-opacity" :class="friend.isMe ? 'group-hover/avatar:opacity-30' : ''">
          <img 
            :src="`https://flagcdn.com/w40/${ friend.flag }.png`"
            alt=""
            class="w-4 h-3 object-cover flex-shrink-0"
          />
        </span>
        <span v-if="friend.isMe" class="absolute inset-0 hidden group-hover/avatar:flex items-center justify-center text-white text-xs font-bold pointer-events-none">
          +
        </span>
      </div>
      
      <!-- 이름 및 상태메시지 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span 
            class="w-1.5 h-1.5 inline-block rounded-full"
            :class="isOffline ? 'bg-neutral-400 group-hover:bg-neutral-500' : 'bg-emerald-500'"
          ></span>
          <span class="text-xs font-bold truncate tracking-tight" :class="isOffline && !isActiveMenu ? 'group-hover:text-[#2d2b28]' : ''">
            {{ friend.name }}
          </span>
          <span v-if="friend.isMe" class="text-[9px] px-1 py-0.2 bg-[#c5bfb6] text-[#2d2b28] font-bold border border-[#2d2b28]">ME</span>
        </div>
        <div 
          class="text-[9px] truncate mt-0.5"
          :class="isActiveMenu ? 'text-[#c5bfb6]' : 'text-neutral-500'"
        >
          {{ friend.statusMsg || (isOffline ? '오프라인' : '상태 메시지가 없습니다.') }}
        </div>
      </div>

      <!-- 토글 화살표 표시 -->
      <div v-if="!isInviteMode" class="text-[8px] opacity-60 px-1">
        <span v-if="isActiveMenu">▲</span>
        <span v-else class="group-hover:translate-y-0.5 inline-block transition-transform">▼</span>
      </div>
    </div>

    <!-- 레트로 하위 서브메뉴 탭 -->
    <Transition name="accordion">
      <div 
        v-if="isActiveMenu && !isInviteMode"
        class="flex bg-[#2d2b28] text-[#fbf9f5] text-[10px] font-bold border-t-2 border-[#2d2b28] divide-x divide-[#4a4641]"
      >
        <template v-if="friend.isMe">
          <button @click.stop="emit('menu-action', 'editBio', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1">
            <span>✎</span> 소개글
          </button>
          <button @click.stop="emit('menu-action', 'editStatus', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1">
            <span>💬</span> 상태메시지
          </button>
          <button
            v-if="isMyOnlineStatus"
            @click.stop="emit('menu-action', 'goOffline', friend.id)"
            class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
          >
            <span>🌙</span> 오프라인
          </button>
          <button
            v-else
            @click.stop="emit('menu-action', 'goOnline', friend.id)"
            class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
          >
            <span>☀️</span> 온라인
          </button>

        </template>
        <template v-else>
          <button @click.stop="emit('menu-action', 'viewBio', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1">
            <span>📄</span> 소개글
          </button>

          <!-- 차단 상태에 따른 분기 처리 -->
          <button v-if="isBlocked" @click.stop="emit('menu-action', 'unblock', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1">
            <span>⭕</span> 차단 해제
          </button>
          <button v-else @click.stop="emit('menu-action', 'block', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1">
            <span>🚫</span> 차단
          </button>

          <button v-if="!isBlocked" @click.stop="emit('menu-action', 'delete', friend.id)" class="flex-1 py-1.5 px-1 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors flex items-center justify-center gap-1">
            <span>✕</span> 삭제
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
  max-height: 40px;
  opacity: 1;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>