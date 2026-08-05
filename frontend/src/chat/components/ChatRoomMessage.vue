<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '../store/ChatRoom'

const props = defineProps<{
  message: Message;
  ownId?: number;
}>()


const isMine = computed(() =>
  props.message.senderId === props.ownId
)

</script>


<template>
  <!-- 메시지 하나 -->
  <div
    class="flex gap-3 max-w-[85%]"
    :class="isMine ? 'self-end flex-row-reverse' : 'self-start'"
  >

    <!-- 상대방 아바타 -->
    <div
      v-if="!isMine"
      class="w-8 h-8 shrink-0 bg-[#2d2b28] text-white flex items-center justify-center border-2 border-[#2d2b28] font-pixel text-sm"
    >
      {{ message.senderName?.charAt(0) }}
    </div>


    <div
      class="flex flex-col gap-1"
      :class="isMine ? 'items-end' : ''"
    >

      <!-- 상대 이름 -->
      <span
        v-if="!isMine"
        class="text-[10px] font-bold text-[#2d2b28]"
      >
        {{ message.senderName }}
      </span>


      <!-- 내용 -->
      <div
        class="p-2 text-xs border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28]"
        :class="
          isMine
          ? 'bg-[#2d2b28] text-[#fbf9f5]'
          : 'bg-[#f4f1eb] text-[#2d2b28]'
        "
      >
        {{ message.content }}
      </div>


      <!-- 시간 -->
      <span class="text-[9px] text-[#726e67]">
        {{ message.createdAt }}
      </span>

    </div>

  </div>
</template>