<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatStore } from '@/chat/store/Chat'
import { onMounted, computed } from 'vue'
import { formatTime } from '@/shared/utils/DateUtils'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { storeToRefs } from 'pinia'
import { Conversation } from '@/chat/store/Chat'

const uiStore = useUIStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore) 

const conversations = computed(() => {
  return chatStore.conversations?.data ?? []
})


onMounted(async () => {
  await chatStore.getMyConversations()
})

const openConversation = (conversation: Conversation) => {
  if (conversation.type === "DIRECT") {
    const otherMember = conversation.members.find(
      member => member.userId !== userInfo.value.id
    );

    uiStore.changeChatRoomTab(
      false,
      otherMember ? [otherMember.userId] : [],
      otherMember?.name ?? ""
    );
    return;
  }

  // GROUP
  uiStore.changeChatRoomTab(
    false,
    conversation.members
      .filter(member => member.userId !== userInfo.value.id)
      .map(member => member.userId),
    conversation.name ?? ""
  );
};



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
        {{ conversations.length }}개
      </span>
    </div>


    <!-- 채팅방 목록 --> 
    <div class="flex-1 overflow-y-auto p-4 space-y-3">

      <div
        v-for="conversation in conversations"
        :key="conversation.conversationId"
        class="group flex items-center gap-3 p-2 bg-[#f4f1eb]
               hover:bg-[#2d2b28] hover:text-[#fbf9f5]
               border-2 border-[#2d2b28]
               shadow-[3px_3px_0px_0px_#2d2b28]
               cursor-pointer transition-all"
        @dblclick="openConversation(conversation)"       
      >

        <!-- 프로필 -->
        <div class="w-10 h-10 shrink-0">

          <!-- 1:1 -->
          <div
            v-if="conversation.type === 'DIRECT'"
            class="w-full h-full bg-[#2d2b28] text-white 
                   flex items-center justify-center 
                   border-2 border-[#2d2b28] font-pixel text-lg"
          >
            <img 
            :src="`https://flagcdn.com/w40/${conversation.members[0]?.flag}.png`"
            alt=""
            class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
          /> 
          </div>


          <!-- 그룹 -->
          <div
            v-else
            class="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full"
          >
            <div
              v-for="member in conversation.members.slice(0,4)"
              :key="member.userId"
              class="bg-[#2d2b28] text-white 
                     flex items-center justify-center 
                     border border-[#2d2b28] text-[10px]"
            >
              <img 
            :src="`https://flagcdn.com/w40/${member?.flag}.png`"
            alt=""
            class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
          /> 
            </div>
          </div>

        </div>


        <!-- 채팅 정보 -->
        <div class="flex-1 min-w-0">

          <div class="flex justify-between items-center">

            <span class="text-xs font-bold truncate">
{{
  conversation?.name
    ?.split('|')
    .find(v => v !== userInfo?.name)
  ?? '1:1 채팅'

}}
             <!-- {{ userInfo?.name?.split('|').map(v => v.split('#')[0]).find(v => v !== conversation?.name) ?? '1:1 채팅' }} -->
            </span>


            <span
              class="text-[10px] text-neutral-500 
                     group-hover:text-neutral-300"
            >
              {{ formatTime(conversation.lastMessageAt) }}
            </span>

          </div>


          <div
            class="text-[10px] text-neutral-500 
                   group-hover:text-neutral-300 truncate"
          >
            {{ conversation.lastMessage?.content ?? '' }}
          </div>

        </div>


        <!-- 안 읽은 메시지 -->
        <div
          v-if="conversation.unreadCount > 0"
          class="w-5 h-5 rounded-full bg-red-500 text-white
                 flex items-center justify-center 
                 text-[10px] font-bold"
        >
          {{
            conversation.unreadCount > 999
              ? '999+'
              : conversation.unreadCount
          }}
        </div>


      </div>

    </div>
  </div>
</template>