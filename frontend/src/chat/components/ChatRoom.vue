<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed} from 'vue' // onMounted, onUnmounted 추가
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import ChatRoomMessage from '@/chat/components/ChatRoomMessage.vue'
import { useAuthStore } from '@/shared/auth/AuthStore'

const uiStore = useUIStore()
const chatRoomStore = useChatRoomStore()

const authStore = useAuthStore();

const ownId = computed(() => authStore.userInfo?.id);


// 메시지 입력 상태
const newMessage = ref('')

// 기능 모달창 상태
const showFeatureModal = ref(false)

// 최근 사용한 기능 아이콘 상태 (기본값: ✨)
const recentIcon = ref('✨')

// 제공할 기능 목록 정의
const features = [
  { id: 'AI', name: 'AI 번역', icon: '✨' },
  { id: 'Translate', name: '번역 태그', subName: '검색', icon: '🏷️' },
  { id: 'Image', name: '사진 삽입', icon: '📷' }
]



// 기능 선택 로직
const selectFeature = (feature: typeof features[number]) => {
  console.log(`${feature.id} 기능 선택됨`)
  
  // 선택한 기능의 아이콘으로 최근 아이콘 업데이트
  recentIcon.value = feature.icon
  
  // 모달 닫기
  showFeatureModal.value = false
}

// 최근 사용 기능 실행 (선택 사항)
const useRecentFeature = () => {
  console.log(`최근 기능(${recentIcon.value}) 실행`)
}

const isRecentFeaturePressed = ref(false)
// --- 추가된 단축키 로직 ---
const handleKeydown = (e: KeyboardEvent) => {
  if (uiStore.currentTab !== 'chatRoom') return;

  if (e.ctrlKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    useRecentFeature(); 

    // 단축키 입력 시 클릭 모션 시각 효과 트리거 (0.15초 동안)
    isRecentFeaturePressed.value = true;
    setTimeout(() => {
      isRecentFeaturePressed.value = false;
    }, 150);
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})


const conversationId = ref<number | null>(null);

const sendMessage = async () => {
  const trimmedMessage = newMessage.value.trim()

  
  // 메시지가 없는 상태면 return
  if (!trimmedMessage) return
  const initialMessage = trimmedMessage || '안녕하세요!'

  const chatRoomMemberIds = uiStore.chatRoomMemberIds
  // memberIds 배열에서 첫 번째 멤버 객체를 탐색
  const targetMember = uiStore.chatRoomMemberIds.find(() => true)

  console.log("uistore is chat room create : ", uiStore.isChatRoomCreate)
  if (uiStore.isChatRoomCreate) {
    
    // 💡 방 이름 구성 (상대방 이름이 있으면 "~님과의 대화방", 없으면 "새 대화방")
    const roomName = targetMember?.name 
      ? `${targetMember.name}_님과의_대화방` 
      : '새_대화방'

    // 💡 입력한 메시지(trimmedMessage)를 전달하되, 빈 값이면 기본값('안녕하세요!') 설정
    

    conversationId.value = await chatRoomStore.createChat({
      memberIds: chatRoomMemberIds,
      chatType: 'DIRECT',
      name: roomName,
      message: initialMessage // ✨ 사용자 입력 메시지가 들어가는 부분!
    }
    )
    
    // 생성 후 상태 초기화
    uiStore.isChatRoomCreate = false
  } else {
    
   await chatRoomStore.createMessage(
    {
      conversationId: conversationId.value,
      
      content: initialMessage
      // content: string;
      // attachments?: unknown | null;
    }
   )
  }

  // 입력창 초기화
  newMessage.value = ''
}
</script>

<template>
  <div
    v-if="uiStore.currentTab === 'chatRoom'"
    class="flex h-full flex-col bg-[#dfdad1]"
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
        // 현재_채팅방.sh
      </span>

      <button class="text-xs font-bold hover:text-white transition-colors">
        옵션
      </button>
    </div>

    <!-- 채팅 메시지 목록 영역 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">

      <ChatRoomMessage
           v-for="message in chatRoomStore.messages"
      :key="message.id"
      :message="message"
      :own-id="ownId"
      />
      <!-- 상대방 메시지
      <div class="flex gap-3 max-w-[85%] self-start">
        <div class="w-8 h-8 shrink-0 bg-[#2d2b28] text-white flex items-center justify-center border-2 border-[#2d2b28] font-pixel text-sm">
          A
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-[#2d2b28]">상대방 이름</span>
          <div class="p-2 text-xs bg-[#f4f1eb] text-[#2d2b28] border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28]">
            안녕하세요! 이전에 말씀하신 내용 확인했습니다.
          </div>
          <span class="text-[9px] text-[#726e67]">오전 10:30</span>
        </div>
      </div> -->

      <!-- 내 메시지 -->
      <!-- <div class="flex gap-3 max-w-[85%] self-end flex-row-reverse">
        <div class="flex flex-col gap-1 items-end">
          <div class="p-2 text-xs bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28]">
            네, 확인 감사합니다. 오늘 중으로 반영해두겠습니다!
          </div>
          <span class="text-[9px] text-[#726e67]">오전 10:32</span>
        </div>
      </div> -->

      <!-- 날짜 구분선 -->
      <div class="flex justify-center my-2">
        <span class="text-[10px] bg-[#c5bfb6] px-2 py-1 border-2 border-[#2d2b28] font-bold text-[#2d2b28]">
          2026. 08. 01
        </span>
      </div>
    </div>

    <!-- 하단 입력창 영역 -->
    <div class="bg-[#c5bfb6] p-3 border-t-2 border-[#2d2b28] relative">
      
      <!-- 기능 아이콘 모달창 -->
      <div 
        v-if="showFeatureModal" 
        class="absolute bottom-full left-3 mb-3 bg-[#f4f1eb] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] p-2 flex gap-2 z-10"
      >
        <!-- 기능 목록 반복 출력 -->
        <button 
          v-for="feature in features"
          :key="feature.id"
          @click="selectFeature(feature)"
          class="flex flex-col items-center gap-1 p-2 hover:bg-[#c5bfb6] border-2 border-transparent hover:border-[#2d2b28] transition-colors"
        >
          <span class="text-lg">{{ feature.icon }}</span>
          <span class="text-[10px] font-bold text-[#2d2b28] text-center leading-tight">
            {{ feature.name }}
            <template v-if="feature.subName">
              <br>{{ feature.subName }}
            </template>
          </span>
        </button>
      </div>

      <!-- 폼 영역 -->
      <div class="flex gap-2 items-center">
        
        <!-- 이전에 썼던 기능 아이콘 (최근 사용 기록) -->
        <button
        type="button"
        @click="useRecentFeature"
        title="최근 사용한 기능"
        class="w-9 h-9 shrink-0 bg-[#f4f1eb] text-xs flex items-center justify-center
                border-2 border-[#2d2b28] transition-all"
        :class="isRecentFeaturePressed 
            ? 'shadow-none translate-x-[2px] translate-y-[2px]' 
            : 'shadow-[2px_2px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'"
        >
        {{ recentIcon }}
        </button>

        <!-- 기능(모달 열기) 아이콘 -->
        <button
          type="button"
          @click="showFeatureModal = !showFeatureModal"
          title="기능 더보기"
          class="w-9 h-9 shrink-0 bg-[#2d2b28] text-white text-lg font-bold flex items-center justify-center
                 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#2d2b28] 
                 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          +
        </button>

        <!-- 텍스트 인풋 -->
        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
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