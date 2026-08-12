<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatStore } from '@/chat/store/Chat'
import { watch, computed } from 'vue'
import { formatTime } from '@/shared/utils/DateUtils'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { storeToRefs } from 'pinia'
import { Conversation } from '@/chat/store/Chat'
import { useChatRoomStore } from '../store/ChatRoom'

const uiStore = useUIStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const chatRoomStore = useChatRoomStore()
const { userInfo } = storeToRefs(authStore) 

const conversations = computed(() => {
  return chatStore.conversations?.data ?? []
})


watch(
  () => authStore.userInfo,
  async (userInfo) => {
    if (!userInfo) return

    await chatStore.getMyConversations()
  },
  { immediate: true }
)

const openConversation = (conversation: Conversation) => {
  if (conversation.type === "DIRECT") {
    const otherMember = conversation.members.find(
      member => String(member.userId) !== String(userInfo.value?.id)
    );
    
    // 1. FriendSidebar와 동일하게 ID를 null로 초기화하여 ChatRoom이 소켓을 새로 연결하도록 유도합니다.
    uiStore.conversationId = null;
    
    const roomName = conversation?.name?.split('|').find(v => v !== userInfo.value?.name) ?? '1:1 채팅';

    uiStore.changeChatRoomTab(
      true, // 2. 매우 중요: 1:1 채팅이므로 반드시 true로 넘겨야 합니다! (기존 false였음)
      otherMember ? [Number(otherMember.userId)] : [], // 안전하게 Number로 변환
      roomName,
      'chatRoom' 
    );
    return;
  }

  // GROUP 로직
  uiStore.conversationId = conversation.conversationId;

  uiStore.changeChatRoomTab(
    false, // 그룹 채팅은 false
    conversation.members
      .filter(member => String(member.userId) !== String(userInfo.value?.id))
      .map(member => member.userId),
    conversation.name ?? "",
    "inviteChatRoom"
  );
};


watch(
  () => conversations.value,
  (newVal) => {
    console.log('채팅방 목록 데이터:', newVal)
    // 첫 번째 채팅방의 안 읽은 메시지 속성 확인
    if (newVal.length > 0) {
      console.log('첫번째 방 unreadCount 값:', newVal[0].unreadCount)
    }
  },
  { deep: true }
)


</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chat'"
    class="flex h-full min-h-0 flex-col bg-[#dfdad1]"
  >
    <!-- 헤더 -->
  <div
    class="shrink-0 bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
  >
    <span class="text-xs font-bold tracking-wider">
      // 채팅방_목록.sh
    </span>

    <span class="text-[10px] text-[#726e67]">
      {{ conversations.length }}개
    </span>
  </div>


    <!-- 채팅방 목록 --> 
  <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
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