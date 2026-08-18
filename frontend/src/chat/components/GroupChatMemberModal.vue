<script setup lang="ts">
import { ref, watch } from 'vue'
import api from '@/shared/auth/api.config'
import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useAuthStore } from '@/shared/auth/AuthStore'

const authStore = useAuthStore()
const chatRoomStore = useChatRoomStore()

// 부모 컴포넌트로부터 받을 데이터(Props)와 보낼 이벤트(Emits) 정의
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'invite-submit', memberIds: number[]): void
  (e: 'member-action', action: string, memberId: number): void
}>()

// API 응답 데이터 타입
export interface GroupChatMember {
  id: number
  name: string
  flag: string
  statusMsg?: string
}

// === 기존 참여 인원 상태 ===
const members = ref<GroupChatMember[]>([])
const expandedMemberIndex = ref<number | null>(null)
const isLoading = ref(false)

// === 초대 모드 전용 상태 ===
const isInviteMode = ref(false) // 초대 모드 활성화 여부
const invitableFriends = ref<GroupChatMember[]>([]) // 초대 가능한 친구 목록
const selectedFriendIds = ref<number[]>([]) // 선택된 친구 ID 배열 (다중 선택 지원)

// isOpen 상태를 감지하여 모달이 열릴 때 API 요청 및 상태 초기화
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      const convId = chatRoomStore.conversationId
      if (!convId) return

      try {
        isLoading.value = true
        // 1. 기존 참여 멤버 목록 불러오기
        const data = await chatRoomStore.getGroupChatMembers(convId)
        const fetchedMembers = Array.isArray(data) ? data : [data]
        
        // ⭐ 본인 제외하고 리스트에 할당
        members.value = fetchedMembers.filter(
          (member) => member.id !== authStore.userInfo?.id
        )
      } catch (error) {
        console.error('멤버 목록을 불러오는 중 오류 발생:', error)
        members.value = []
      } finally {
        isLoading.value = false
      }
    } else {
      // 모달이 닫힐 때 모든 상태 초기화
      expandedMemberIndex.value = null
      isInviteMode.value = false
      selectedFriendIds.value = []
      invitableFriends.value = []
    }
  },
  { immediate: true }
)

const toggleMember = (index: number) => {
  expandedMemberIndex.value = expandedMemberIndex.value === index ? null : index
}

// === 초대 모드 관련 함수 ===
const openInviteMode = async () => {
  isInviteMode.value = true
  selectedFriendIds.value = []
  isLoading.value = true

  try {
    const response = await api.get('/api/friends')
    
    // 💡 백엔드 응답 구조 ({ friends: [...], message: "..." })에 맞게 배열을 추출합니다.
    const rawList = response.data?.friends
    
    // 배열인지 확실히 검증하여 안전하게 할당
    const friendsList: GroupChatMember[] = Array.isArray(rawList) ? rawList : []

    // 현재 채팅방에 이미 참여 중인 멤버 ID 목록 (O(1) 조회를 위해 Set 사용)
    const existingMemberIds = new Set(members.value.map((m) => m.id))
    
    // 본인 제외 & 이미 참여중인 멤버 제외 필터링 적용
    invitableFriends.value = friendsList.filter(
      (friend) => friend.id !== authStore.userInfo?.id && !existingMemberIds.has(friend.id)
    )

  } catch (error) {
    console.error('초대 가능 인원을 불러오는 중 오류 발생:', error)
    invitableFriends.value = []
  } finally {
    isLoading.value = false
  }
}

// 체크박스 토글 함수 (다중 선택)
const toggleSelection = (friendId: number) => {
  const index = selectedFriendIds.value.indexOf(friendId)
  if (index === -1) {
    selectedFriendIds.value.push(friendId)
  } else {
    selectedFriendIds.value.splice(index, 1)
  }
}

const cancelInviteMode = () => {
  isInviteMode.value = false
  selectedFriendIds.value = []
}

const submitInvite = async () => {
  if (selectedFriendIds.value.length === 0) return

  const convId = chatRoomStore.conversationId
  if (!convId) {
    console.error('대화방 ID가 존재하지 않습니다.')
    return
  }

  try {
    isLoading.value = true

    // 💡 /api/chat-room/invite API 호출 (대화방 ID와 선택된 멤버 ID 배열 전달)
    await api.post('/api/chat-room/invite', {
      conversationId: convId,      // 대화방 ID (백엔드 필드명에 맞춰 chatRoomId 등으로 수정 가능)
      memberIds: selectedFriendIds.value // 초대할 친구 ID 배열
    })

    alert('초대가 완료되었습니다.')

    // 초대 모드 종료 및 선택 상태 초기화
    isInviteMode.value = false
    selectedFriendIds.value = []

    // 💡 초대 완료 후 새로 추가된 멤버 목록 다시 불러오기
    const data = await chatRoomStore.getGroupChatMembers(convId)
    const fetchedMembers = Array.isArray(data) ? data : [data]
    members.value = fetchedMembers.filter(
      (member) => member.id !== authStore.userInfo?.id
    )

    // 부모 컴포넌트에 이벤트 알림이 필요하다면 유지, 불필요 시 생략 가능
    emit('invite-submit', selectedFriendIds.value)

  } catch (error) {
    console.error('인원 초대 중 오류 발생:', error)
    alert('초대에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="emit('close')"
  >
    <!-- 모달 컨테이너 (레트로 윈도우 창) -->
    <div
      class="w-full max-w-sm bg-[#e6e2db] 
             border-4 border-[#2d2b28] 
             shadow-[8px_8px_0px_0px_#121315] 
             overflow-hidden flex flex-col max-h-[80vh] transition-all"
    >
      <!-- 헤더 -->
      <div
        class="bg-[#2d2b28] text-[#fbf9f5] 
               px-4 py-1.5 flex justify-between items-center 
               text-xs font-bold shrink-0"
      >
        <span>{{ isInviteMode ? '// 인원_초대.cfg' : '// 대화_상대_목록.cfg' }}</span>

        <button
          class="hover:text-red-400 font-pixel text-lg leading-none transition-colors"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <!-- 본문 영역 -->
      <div class="p-5 flex flex-col flex-1 overflow-hidden space-y-4">
        
        <!-- 동적 타이틀 텍스트 -->
        <p class="text-xs font-bold uppercase text-neutral-500 shrink-0">
          // {{ isInviteMode ? '초대할 인원 선택 (다중 선택 가능)' : '현재 참여 인원' }}
        </p>

        <!-- 스크롤 영역 -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          
          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="text-center py-8 text-xs font-bold text-neutral-500 animate-pulse">
            // 데이터를 불러오는 중...
          </div>
          
          <!-- 1. [초대할 인원] 목록 화면 -->
          <template v-else-if="isInviteMode">
            <div v-if="invitableFriends.length === 0" class="text-center py-8 text-xs font-bold text-neutral-500">
              // 초대할 수 있는 친구가 없습니다.
            </div>
            
            <div
              v-else
              v-for="(friend, index) in invitableFriends"
              :key="friend.id || index"
              @click="toggleSelection(friend.id)"
              class="group flex items-center gap-3 p-2 cursor-pointer transition-colors bg-[#f4f1eb] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] hover:bg-[#e8e3d8]"
            >
              <!-- 커스텀 체크박스 버튼 -->
              <div class="w-4 h-4 border-2 border-[#2d2b28] flex items-center justify-center bg-[#fbf9f5] shrink-0">
                <div v-if="selectedFriendIds.includes(friend.id)" class="w-2.5 h-2.5 bg-[#2d2b28]"></div>
              </div>

              <!-- 아바타 (국기) -->
              <div class="relative w-7 h-7 flex items-center justify-center border border-[#2d2b28] shrink-0 bg-[#2d2b28]">
                <img
                  :src="`https://flagcdn.com/w40/${friend.flag || 'kr'}.png`"
                  alt=""
                  class="w-4 h-3 object-cover flex-shrink-0"
                />
              </div>

              <!-- 이름 및 상태메시지 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold truncate tracking-tight text-[#2d2b28]">
                    {{ friend.name }}
                  </span>
                </div>
                <div class="text-[9px] truncate mt-0.5 text-neutral-500">
                  {{ friend.statusMsg || '상태 메시지가 없습니다.' }}
                </div>
              </div>
            </div>
          </template>

          <!-- 2. [현재 참여 인원] 목록 화면 -->
          <template v-else>
            <div v-if="members.length === 0" class="text-center py-8 text-xs font-bold text-neutral-500">
              // 대화 상대가 존재하지 않습니다.
            </div>

            <div
              v-else
              v-for="(member, index) in members"
              :key="member.id || index"
              class="border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] transition-all overflow-hidden"
              :class="expandedMemberIndex === index ? 'bg-[#3d3a36] text-[#fbf9f5]' : 'bg-[#f4f1eb]'"
            >
              <!-- 멤버 프로필 영역 -->
              <div 
                @click="toggleMember(index)" 
                class="group flex items-center gap-2.5 p-2 cursor-pointer transition-colors relative"
                :class="expandedMemberIndex === index ? '' : 'hover:bg-[#e8e3d8] text-[#2d2b28]'"
              >
                <!-- 아바타 (국기) -->
                <div class="relative w-7 h-7 flex items-center justify-center border border-[#2d2b28] shrink-0 bg-[#2d2b28]">
                  <img
                    :src="`https://flagcdn.com/w40/${member.flag || 'kr'}.png`"
                    alt=""
                    class="w-4 h-3 object-cover flex-shrink-0"
                  />
                </div>

                <!-- 이름 및 상태메시지 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 inline-block rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-bold truncate tracking-tight">
                      {{ member.name }}
                    </span>
                  </div>
                  <div 
                    class="text-[9px] truncate mt-0.5"
                    :class="expandedMemberIndex === index ? 'text-[#c5bfb6]' : 'text-neutral-500'"
                  >
                    {{ member.statusMsg || '상태 메시지가 없습니다.' }}
                  </div>
                </div>

                <!-- 토글 화살표 표시 -->
                <div class="text-[8px] opacity-60 px-1">
                  <span v-if="expandedMemberIndex === index">▲</span>
                  <span v-else class="group-hover:translate-y-0.5 inline-block transition-transform">▼</span>
                </div>
              </div>

              <!-- 확장 메뉴 (소개글 / 친구 추가 / 차단) -->
              <Transition name="accordion">
                <div 
                  v-show="expandedMemberIndex === index" 
                  class="flex bg-[#2d2b28] text-[#fbf9f5] text-[10px] font-bold border-t-2 border-[#2d2b28] divide-x divide-[#4a4641]"
                >
                  <button 
                    @click.stop="emit('member-action', 'viewBio', member)" 
                    class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>📄</span> 소개글
                  </button>
                  <button 
                    @click.stop="emit('member-action', 'addFriend', member)" 
                    class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>➕</span> 친구 추가
                  </button>
                  <button 
                    @click.stop="emit('member-action', 'block', member)" 
                    class="flex-1 py-1.5 px-1 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🚫</span> 차단
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <!-- 하단 컨트롤 버튼 영역 -->
        <div class="mt-2 flex justify-end gap-3 text-xs shrink-0 pt-4 border-t-2 border-dashed border-[#2d2b28]">
          
          <!-- 1. [초대할 인원] 모드 버튼 -->
          <template v-if="isInviteMode">
            <button
              @click="cancelInviteMode"
              class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-300 transition-all"
            >
              취소
            </button>
            <button
              @click="submitInvite"
              :disabled="selectedFriendIds.length === 0"
              class="border-2 border-[#2d2b28] px-4 py-1.5 font-bold transition-all shadow-[2px_2px_0px_0px_#a39b90]"
              :class="selectedFriendIds.length > 0
                ? 'bg-[#2d2b28] text-[#fbf9f5] hover:bg-neutral-800' 
                : 'bg-neutral-400 text-neutral-600 cursor-not-allowed shadow-none border-neutral-500'"
            >
              선택 초대 ({{ selectedFriendIds.length }}명)
            </button>
          </template>

          <!-- 2. [현재 참여 인원] 모드 버튼 -->
          <template v-else>
            <button
              @click="emit('close')"
              class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-300 transition-all"
            >
              닫기
            </button>
            <button
              @click="openInviteMode"
              class="bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_0px_#a39b90]"
            >
              대화방 초대
            </button>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 아코디언 열림/닫힘 애니메이션 */
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