<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'

const uiStore = useUIStore()
const chatStore = useChatRoomStore()
</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chat'"
    class="flex h-full flex-col bg-[#dfdad1]"
  >
    <!-- 헤더 -->
    <div
      class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
    >
      <span class="text-xs font-bold tracking-wider">
        // 채팅방_목록.sh
      </span>

      <span class="text-[10px] text-[#726e67]">
        {{ chatStore.rooms.length }}개
      </span>
    </div>

    <!-- 채팅방 목록 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">

      <div
        v-for="room in chatStore.rooms"
        :key="room.id"
        class="group flex items-center gap-3 p-2 bg-[#f4f1eb]
               hover:bg-[#2d2b28] hover:text-[#fbf9f5]
               border-2 border-[#2d2b28]
               shadow-[3px_3px_0px_0px_#2d2b28]
               cursor-pointer transition-all"
      >
        <!-- 프로필 -->
        <div class="w-10 h-10 shrink-0">

          <!-- 1:1 -->
          <div
            v-if="room.members.length === 1"
            class="w-full h-full bg-[#2d2b28] text-white flex items-center justify-center border-2 border-[#2d2b28] font-pixel text-lg"
          >
            {{ room.members[0].flag }}
          </div>

          <!-- 그룹 -->
          <div
            v-else
            class="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full"
          >
            <div
              v-for="member in room.members.slice(0, 4)"
              :key="member.id"
              class="bg-[#2d2b28] text-white flex items-center justify-center border border-[#2d2b28] text-[10px]"
            >
              {{ member.flag }}
            </div>
          </div>
        </div>

        <!-- 채팅 정보 -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold truncate">
              {{ room.name }}
            </span>

            <span
              class="text-[10px] text-neutral-500 group-hover:text-neutral-300"
            >
              {{ room.lastTime }}
            </span>
          </div>

          <div
            class="text-[10px] text-neutral-500 group-hover:text-neutral-300 truncate"
          >
            {{ room.lastMessage }}
          </div>
        </div>

        <!-- 안 읽은 메시지 -->
        <div
          v-if="room.unread > 0"
          class="w-5 h-5 rounded-full bg-red-500 text-white
                 flex items-center justify-center text-[10px] font-bold"
        >
          {{ room.unread }}
        </div>
      </div>

    </div>
  </div>
</template>