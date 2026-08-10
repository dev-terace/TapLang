<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import { useUIStore } from '@/shared/ui/UiStore.js'

// Modals
import FriendModal from './FriendModal.vue'
import CountryModal from '@/profile/components/CountryModal.vue'
import EditBioModal from '@/profile/components/EditBioModal.vue'
import ViewBioModal from '@/profile/components/ViewBioModal.vue'
import CreateRoomModal from './CreateRoomModal.vue' // 새로 만든 모달 추가

// Components
import FriendSidebarHeader from './FriendSidebarHeader.vue'
import FriendRequestItem from './FriendRequestItem.vue'
import FriendListItem from './FriendListItem.vue'

const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const alertFunc = (msg: string) => alert(msg)

// 드롭다운 메뉴 상태
const activeMenuId = ref<string | null>(null)
const toggleMenu = (id: string) => activeMenuId.value = activeMenuId.value === id ? null : id
const closeMenu = () => activeMenuId.value = null

// 메뉴 핸들러 통합
const handleMenuAction = (action: string, friendId: string) => {
  closeMenu()
  if (['editBio', 'editStatus', 'goOffline'].includes(action)) {
    if (action === 'editBio') modalStore.openModal('editBio')
    if (action === 'editStatus') alertFunc('상태 메시지 편집 기능 준비중입니다.')
    if (action === 'goOffline') alertFunc('오프라인 전환 기능 준비중입니다.')
  } else {
    uiStore.profileMenuFriendId = friendId
    if (action === 'viewBio') modalStore.openModal('viewBio')
    if (action === 'block') alertFunc('차단하기 기능 준비중입니다.')
    if (action === 'delete' && confirm('정말 삭제하시겠습니까?')) alertFunc('삭제 기능 준비중입니다.')
  }
}

// 더블클릭 채팅 진입 핸들러
const handleDoubleClick = (friend: any) => {
  // 1. 기존 방 ID 초기화 (매우 중요! 누락 시 이전 방에 진입함)
  uiStore.conversationId = null
  
  // 2. 4번째 인자로 'chatRoom' 탭을 명시
  uiStore.changeChatRoomTab(true, [friend.id], friend.name, 'chatRoom')
}

// 검색 및 초대 모드 관련 상태
const searchQuery = ref('')
const isInviteMode = ref(false)
const selectedFriends = ref<string[]>([]) // id 타입을 고려해 string[]으로 수정

const startInviteMode = () => {
  isInviteMode.value = true
  selectedFriends.value = []
  closeMenu()
}

const cancelInvite = () => {
  isInviteMode.value = false
  selectedFriends.value = []
}

const toggleSelection = (id: string) => {
  if (selectedFriends.value.includes(id)) {
    selectedFriends.value = selectedFriends.value.filter(fid => fid !== id)
  } else {
    selectedFriends.value.push(id)
  }
}

// 목록 데이터
const onlineList = computed(() => {
  if (!authStore.userInfo) return []
  return [
    { ...authStore.userInfo, online: true, isMe: true },
    ...friendStore.onlineFriends.map(friend => ({ ...friend, isMe: false }))
  ]
})

const filteredOnlineList = computed(() => 
  searchQuery.value ? onlineList.value.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase())) : onlineList.value
)

const filteredOfflineFriends = computed(() => 
  searchQuery.value ? friendStore.offlineFriends.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase())) : friendStore.offlineFriends
)

const reqFriends = computed(() => friendStore.reqFriends)

// ====== 채팅방 이름 모달 관련 로직 추가 ======
const isCreateRoomModalOpen = ref(false)

// 선택된 친구들의 이름만 추출하는 computed (모달에 전달하기 위함)
const selectedFriendNames = computed(() => {
  const allFriends = [...onlineList.value, ...friendStore.offlineFriends]
  return allFriends
    .filter(f => selectedFriends.value.includes(f.id))
    .map(f => f.name)
})

// 초대 완료 버튼 클릭 시 -> 바로 방을 만들지 않고 모달을 띄움
const completeInvite = () => {
  if (selectedFriends.value.length === 0) return alertFunc('초대할 친구를 선택해주세요.')
  isCreateRoomModalOpen.value = true
}

// 모달에서 '확인' 버튼을 눌렀을 때 실행되는 실제 채팅방 생성 로직
const handleCreateChatRoom = (roomName: string) => {
  if (!authStore.userInfo?.id) return alertFunc('사용자 정보를 찾을 수 없습니다.')

  // 1. 기존 conversationId 초기화 (새 방 생성을 위함)
  uiStore.conversationId = null

  // 2. 본인 ID를 포함시키고, 배열 복사본([...])을 전달
  const allMemberIds = [...selectedFriends.value]
  
  uiStore.currentTab = 'inviteChatRoom'
  uiStore.chatRoomMemberIds = allMemberIds

  isCreateRoomModalOpen.value = false
  cancelInvite()
}
</script>

<template>
  <section class="w-full lg:w-80 bg-[#dfdad1] lg:border-r-4 border-b-4 lg:border-b-0 border-[#2d2b28] flex flex-col shrink-0 select-none">
    
    <FriendSidebarHeader 
      v-model:searchQuery="searchQuery"
      :isInviteMode="isInviteMode"
      @add-friend="modalStore.openModal('addFriend')"
      @start-invite="startInviteMode"
      @cancel-invite="cancelInvite"
      @complete-invite="completeInvite"
    />

    <div v-if="activeMenuId" @click="closeMenu" class="fixed inset-0 z-40"></div>

    <div class="flex-1 overflow-y-auto p-3 space-y-3 z-50 relative custom-scrollbar">
      <!-- (중략) 기존과 동일한 친구 목록 렌더링 영역 -->
      
      <div v-if="reqFriends.length > 0 && !searchQuery && !isInviteMode">
        <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-2">
          ● 친구 요청
        </div>
        <div class="space-y-2">
          <FriendRequestItem 
            v-for="friend in reqFriends" 
            :key="friend.id" 
            :friend="friend"
            @accept="friendStore.acceptFriendRequest"
            @decline="friendStore.declinedFriendRequest"
          />
        </div>
      </div>

      <div v-if="filteredOnlineList.length > 0">
        <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-4 mb-2">
          ● 온라인 인맥
        </div>
        <div class="space-y-2">
          <FriendListItem
            v-for="friend in filteredOnlineList"
            :key="friend.id"
            :friend="friend"
            :isInviteMode="isInviteMode"
            :isSelected="selectedFriends.includes(friend.id)"
            :isActiveMenu="activeMenuId === friend.id"
            @toggle-menu="toggleMenu"
            @toggle-select="toggleSelection"
            @double-click="handleDoubleClick"
            @menu-action="handleMenuAction"
            @open-country-modal="modalStore.openModal('selectCountry')"
          />
        </div>
      </div>

      <div v-if="filteredOfflineFriends.length > 0">
        <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-5 mb-2">
          ○ 오프라인 인맥
        </div>
        <div class="space-y-2">
          <FriendListItem
            v-for="friend in filteredOfflineFriends"
            :key="friend.id"
            :friend="friend"
            :isOffline="true"
            :isInviteMode="isInviteMode"
            :isSelected="selectedFriends.includes(friend.id)"
            :isActiveMenu="activeMenuId === friend.id"
            @toggle-menu="toggleMenu"
            @toggle-select="toggleSelection"
            @menu-action="handleMenuAction"
          />
        </div>
      </div>
    </div>
      
    <!-- 모달 컴포넌트들 -->
    <FriendModal/>
    <CountryModal/>
    <EditBioModal/>
    <ViewBioModal/>
    
    <!-- 추가된 채팅방 이름 모달 -->
    <CreateRoomModal
      :is-open="isCreateRoomModalOpen"
      :friend-names="selectedFriendNames"
      @close="isCreateRoomModalOpen = false"
      @confirm="handleCreateChatRoom"
    />
  </section>
</template>