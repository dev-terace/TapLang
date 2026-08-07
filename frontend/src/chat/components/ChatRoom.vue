<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue' // onMounted, onUnmounted 추가
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import { useAuthStore } from '@/shared/auth/AuthStore'
import ChatFeatureModal from './ChatFeatureModel.vue'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()

const authStore = useAuthStore();

const ownId = computed(() => authStore.userInfo?.id);


// 메시지 입력 상태
const newMessage = ref('')



watch(
  () => uiStore.chatRoomMemberIds,
  async (memberIds) => {
    if (memberIds.length !== 1) return;

    // 이미 방이 있으면 생성하지 않음
    

    const conversationId = await chatRoomStore.createChat({
      memberIds,
      chatType: 'DIRECT',
      name: null,
      message: ""
    });


      if(chatRoomStore.conversationId == conversationId)
      {
        return
      }

    chatRoomStore.conversationId = conversationId;

    if(!chatRoomStore.hasMessageCache(chatRoomStore.conversationId))
    {
        await loadMessages(conversationId);
        console.log("메시지 로드")
    }  
    
  },
  {
    deep: true,
    immediate: true
  }
);

const loadMessages = async (id: string) => {
  if (!id) return;

  try {
    const { data } = await chatRoomStore.getChatMessages(id);
    
    data.reverse().forEach((message) => {
      chatRoomStore.addMessage(message);
      
    });

  } catch (error) {
    console.error("메시지 조회 실패", error);
    chatRoomStore.messages = [];
  }
};





const sendMessage = async () => {
  const trimmedMessage = newMessage.value.trim()

  
  // 메시지가 없는 상태면 return
  if (!trimmedMessage) return
  const initialMessage = trimmedMessage || '안녕하세요!'

  const chatRoomMemberIds = uiStore.chatRoomMemberIds

  console.log("uistore is chat room create : ", uiStore.isChatRoomCreate)
  if (chatRoomStore.conversationId == null) {
    
    // 💡 방 이름 구성 (상대방 이름이 있으면 "~님과의 대화방", 없으면 "새 대화방")

    // 💡 입력한 메시지(trimmedMessage)를 전달하되, 빈 값이면 기본값('안녕하세요!') 설정


    chatRoomStore.conversationId = await chatRoomStore.createChat({
      memberIds: chatRoomMemberIds,
      chatType: 'DIRECT',
      name: null,
      message: "" // ✨ 사용자 입력 메시지가 들어가는 부분!
    }
    )
    
  } else {
    
   await chatRoomStore.createMessage(
    {
      conversationId: chatRoomStore.conversationId,
      
      content: initialMessage
      // content: string;
      // attachments?: unknown | null;
    }
   )
  }

  // 입력창 초기화
  newMessage.value = ''
}

const filteredMessages = computed(() =>
  chatRoomStore.messages.filter(
    message => message.conversationId === chatRoomStore.conversationId
  )
);


</script>

<template>
    <div
      v-if="uiStore.currentTab === 'chatRoom'"
      class="flex h-screen min-h-0 flex-col bg-[#dfdad1]"
    >
    <!-- 헤더 -->
    <div
      class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center"
    >
      <button 
        @click="uiStore.currentTab = 'chat'"
        class="text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
      >
        <span>&lt;</span> 뒤로
      </button>

      <span class="text-xs font-bold tracking-wider">
        {{uiStore.roomName}}
      </span>

      <button class="text-xs font-bold hover:text-white transition-colors">
        옵션
      </button>
    </div>

    <!-- 채팅 메시지 목록 영역 -->
    <div
      class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col"
    >
    
    <ChatRoomMessage
      v-for="message in filteredMessages"
      :key="message.id"
      :message="message"
      :own-id="ownId"
    />
    

      <!-- 날짜 구분선 -->
      <div class="flex justify-center my-2">
        <span class="text-[10px] bg-[#c5bfb6] px-2 py-1 border-2 border-[#2d2b28] font-bold text-[#2d2b28]">
          2026. 08. 01
        </span>
      </div>
    </div>

    <!-- 하단 입력창 영역 -->
    <div class="relative shrink-0 bg-[#c5bfb6] p-3 border-t-2 border-[#2d2b28]">

      <!-- 폼 영역 -->
      <div class="flex gap-2 items-center">
        
        <ChatFeatureModal @select="selectFeature"/>
    
        <!-- 텍스트 인풋 -->
        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          @keyup.enter="sendMessage"
          class="flex-1 bg-[#f4f1eb] text-xs p-2 border-2 border-[#2d2b28] text-[#2d2b28] 
                placeholder-[#726e67] focus:outline-none focus:ring-0
                shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] h-9"
        />
        
        <!-- 전송 버튼 -->
        <button
          @click="sendMessage"
          class="bg-[#2d2b28] text-white text-xs font-bold px-4 h-9
                 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] 
                 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>