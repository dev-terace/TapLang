<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue' // onMounted 추가
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import { useUIStore } from '@/shared/ui/UiStore.js'
import { useBlockStore } from '@/block/store/BlockStore.js'
import { useProfileStore } from '@/profile/store/ProfileStore.js'
import { useSocketRegister } from '@/shared/socket/socket.register.js'
import { useChatStore } from '@/chat/store/Chat.js'
// Modals
import FriendModal from './FriendModal.vue'
import CountryModal from '@/profile/components/CountryModal.vue'
import EditBioModal from '@/profile/components/EditBioModal.vue'
import ViewBioModal from '@/profile/components/ViewBioModal.vue'
import CreateRoomModal from './CreateRoomModal.vue'

// Components
import FriendSidebarHeader from './FriendSidebarHeader.vue'
import FriendRequestItem from './FriendRequestItem.vue'
import FriendListItem from './FriendListItem.vue'
import { useChatNavigation } from '@/chat/composables/chatRoom.vue/useChatNavigation.js'

const { openDirectChatWithUser } = useChatNavigation()

const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const blockStore = useBlockStore()
const profileStore = useProfileStore()
const isMyOnlineStatus = ref<boolean | null>(null)
const chatStore = useChatStore()


const socket = useSocketRegister()
const alertFunc = (msg: string) => alert(msg)

// 컴포넌트 마운트 시 차단 목록 불러오기 (초기 데이터 세팅)
watch(
  () => authStore.userInfo,
  (userInfo) => {
    if (!userInfo) return

    isMyOnlineStatus.value = userInfo.showOnlineStatus
    blockStore.getBlockedUsers()
  },
  { immediate: true }
)



// 드롭다운 메뉴 상태
const activeMenuId = ref<string | null>(null)
const toggleMenu = (id: string) => activeMenuId.value = activeMenuId.value === id ? null : id
const closeMenu = () => activeMenuId.value = null

// 메뉴 핸들러 통합
const handleMenuAction = async (action: string, friendId: string) => {
  
  closeMenu()
  if (['editBio', 'editStatus', 'goOffline', 'goOnline'].includes(action)) {
    if (action === 'editBio') modalStore.openModal('editBio')
    if (action === 'editStatus') alertFunc('상태 메시지 편집 기능 준비중입니다.')
    if (action === 'goOffline') {
        await profileStore.updateOnlineStatusVisibility(false)
        isMyOnlineStatus.value = false 
        socket.socket.emit("friend:own:init");
    }
    if (action === 'goOnline')
    {
      await profileStore.updateOnlineStatusVisibility(true)
      isMyOnlineStatus.value = true
       socket.socket.emit("friend:own:init");
    }
  } else {
    uiStore.profileMenuFriendId = friendId
    if (action === 'viewBio') modalStore.openModal('viewBio')
    if (action === 'block') {
        // 비동기 처리(await)와 오타 수정(getBlockedUsers) 적용
        await blockStore.requestBlockUser(Number(friendId)) // string -> number 타입 캐스팅 필요 시 적용
        // await friendStore.fetchFriends() // 친구 목록 최신화
        // await blockStore.getBlockedUsers() // 차단 목록 최신화
    }
    if(action === 'unblock')
    {
        await blockStore.unBlockedUser(Number(friendId))
        // await blockStore.getBlockedUsers() 
    }
    if (action === 'delete' && confirm('정말 삭제하시겠습니까?')) {
      friendStore.deleteFriend(Number(friendId))
    }
  }
}

// 더블클릭 채팅 진입 핸들러
// const handleDoubleClick = async (friend: any) => {
//   // 1. 최신 대화 목록 확인
//   await chatStore.getMyConversations()

//   // 2. 해당 친구와의 기존 1:1 채팅방 검색
//   const existingRoom = chatStore.conversations?.data?.find((c: any) => 
//     c.type === 'DIRECT' && 
//     c.members.some((m: any) => String(m.userId) === String(friend.id))
//   )

//   if (existingRoom) {
//     // 기존 방이 존재하면 ID 세팅 (메시지 내역 바로 로드)
//     uiStore.conversationId = existingRoom.conversationId
//     uiStore.isChatRoomCreate = false
//   } else {
//     // 신규 방인 경우 null 처리 및 생성 플래그 true
//     uiStore.conversationId = null
//     uiStore.isChatRoomCreate = true
//   }

//   uiStore.changeChatRoomTab(true, [Number(friend.id)], friend.name, 'chatRoom')
// }
const handleDoubleClick = async (friend: any) => {
  openDirectChatWithUser(friend.id, friend.name)
}

// 검색 및 초대 모드 관련 상태
const searchQuery = ref('')
const isInviteMode = ref(false)
const selectedFriends = ref<string[]>([])


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

// ====== 💡 새로 추가: 차단된 유저 목록 ======
const filteredBlockedUsers = computed(() => {
  const users = blockStore.blockedUsers || [] // undefined 방어
  return searchQuery.value 
    ? users.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase())) 
    : users
})

// ====== 채팅방 이름 모달 관련 로직 ======
const isCreateRoomModalOpen = ref(false)

const selectedFriendNames = computed(() => {
  const allFriends = [...onlineList.value, ...friendStore.offlineFriends]
  return allFriends
    .filter(f => selectedFriends.value.includes(f.id))
    .map(f => f.name)
})

const completeInvite = () => {
  if (selectedFriends.value.length === 0) return alertFunc('초대할 친구를 선택해주세요.')
  isCreateRoomModalOpen.value = true
}

const handleCreateChatRoom = (roomName: string) => {
  if (!authStore.userInfo?.id) return alertFunc('사용자 정보를 찾을 수 없습니다.')

  uiStore.conversationId = null
  const allMemberIds = [...selectedFriends.value]
  
  uiStore.currentTab = 'inviteChatRoom'
  uiStore.chatRoomMemberIds = allMemberIds
  uiStore.isChatRoomCreate = true
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
      
      <!-- 친구 요청 -->
      <div v-if="reqFriends?.length > 0 && !searchQuery && !isInviteMode">
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

      <!-- 온라인 인맥 -->
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
            :isMyOnlineStatus="isMyOnlineStatus"

            @toggle-menu="toggleMenu"
            @toggle-select="toggleSelection"
            @double-click="handleDoubleClick"
            @menu-action="handleMenuAction"
            @open-country-modal="modalStore.openModal('selectCountry')"
          />
        </div>
      </div>

      <!-- 오프라인 인맥 -->
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

      <!-- 💡 새로 추가: 차단된 인맥 (초대 모드가 아닐 때만 렌더링) -->
      <div v-if="filteredBlockedUsers.length > 0 && !isInviteMode">
        <div class="text-[10px] font-bold text-red-700/70 tracking-widest border-b border-red-700/30 pb-1 mt-5 mb-2">
          ■ 차단된 인맥
        </div>
        <div class="space-y-2 opacity-50 grayscale"> <!-- 차단된 유저 시각적 효과 부여 -->
          <FriendListItem
            v-for="friend in filteredBlockedUsers"
            :key="'block-' + friend.id"
            :friend="friend"
            :isOffline="true"
            :isInviteMode="false"
            :isBlocked="true"
            :isActiveMenu="activeMenuId === friend.id"
            @toggle-menu="toggleMenu"
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
    
    <CreateRoomModal
      :is-open="isCreateRoomModalOpen"
      :friend-names="selectedFriendNames"
      @close="isCreateRoomModalOpen = false"
      @confirm="handleCreateChatRoom"
    />
  </section>
</template>