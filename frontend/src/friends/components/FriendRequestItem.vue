<script setup lang="ts">
defineProps<{
  friend: { id: string, name: string, flag: string, status: string }
}>()

const emit = defineEmits<{
  (e: 'accept', id: string): void
  (e: 'decline', id: string, isSent: boolean): void
}>()
</script>

<template>
  <div class="group flex items-center gap-2.5 p-2 bg-[#f4f1eb] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28]">
    <!-- 아바타 -->
    <div class="w-7 h-7 bg-[#2d2b28] flex items-center justify-center border border-[#2d2b28] shrink-0">
      <img :src="`https://flagcdn.com/w40/${friend.flag}.png`" alt="" class="w-4 h-3 object-cover" />
    </div>

    <!-- 이름 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-amber-500 inline-block rounded-full animate-pulse"></span>
        <span class="text-xs font-bold truncate text-[#2d2b28]">{{ friend.name }}</span>
      </div>
      <div class="text-[9px] text-[#726e67] truncate mt-0.5">
        {{ friend.status == "SENT" ? "친구 요청 대기중" : "친구 요청이 도착했습니다" }}
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="flex gap-1 shrink-0">
      <button
        v-if="friend.status == 'SENT'"
        @click="emit('decline', friend.id, true)"
        class="bg-amber-500 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-amber-600 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
      >
        취소
      </button>

      <template v-else-if="friend.status == 'RECEIVED'">
        <button
          @click="emit('accept', friend.id)"
          class="bg-emerald-600 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-emerald-700 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
        >
          수락
        </button>
        <button
          @click="emit('decline', friend.id, false)"
          class="bg-rose-600 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-rose-700 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
        >
          거절
        </button>
      </template>
    </div>
  </div>
</template>