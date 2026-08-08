<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFriendStore } from '@/friends/stores/FriendStore.js'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import FriendModal from './FriendModal.vue'
import CountryModal from './CountryModal.vue'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import { useUIStore } from '@/shared/ui/UiStore.js'
import EditBioModal from '../../profile/components/EditBioModal.vue'
import ViewBioModal from '@/profile/components/ViewBioModal.vue'

const friendStore = useFriendStore()
const modalStore = useModalStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const alertFunc = (msg: string) => {
  alert(msg)
}

// 드롭다운 메뉴 상태
const activeMenuId = ref<string | null>(null)

const toggleMenu = (id: string) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const closeMenu = () => {
  activeMenuId.value = null
}

// 내 프로필 메뉴 핸들러
const handleMyProfileMenu = (action: string) => {
  closeMenu()
  if (action === 'editBio') {
    modalStore.openModal('editBio')
  }
  if (action === 'editStatus') alertFunc('상태 메시지 편집 기능 준비중입니다.')
  if (action === 'goOffline') alertFunc('오프라인 전환 기능 준비중입니다.')
}

// 다른 유저 메뉴 핸들러
const handleOtherProfileMenu = (action: string, friendId: string) => {
  closeMenu()
  uiStore.profileMenuFriendId = friendId
  if (action === 'viewBio') {
    modalStore.openModal('viewBio')
    
  }
  if (action === 'block') alertFunc('차단하기 기능 준비중입니다.')
  if (action === 'delete') {
    if (confirm('정말 삭제하시겠습니까?')) {
      alertFunc('삭제 기능 준비중입니다.')
      // friendStore.deleteFriend(friendId)
    }
  }
}

// 내 프로필 + 온라인 친구 목록
const onlineList = computed(() => {
  if (!authStore.userInfo) return []

  return [
    {
      id: authStore.userInfo.id,
      name: authStore.userInfo.name,
      flag: authStore.userInfo.flag,
      statusMsg: authStore.userInfo.statusMsg,
      online: true,
      isMe: true
    },
    ...friendStore.onlineFriends.map(friend => ({
      ...friend,
      isMe: false
    }))
  ]
})

const reqFriends = computed(() => friendStore.reqFriends)



</script>

<template>
  <section class="w-full lg:w-80 bg-[#dfdad1] lg:border-r-4 border-b-4 lg:border-b-0 border-[#2d2b28] flex flex-col shrink-0 select-none">
    
    <!-- 주소록 헤더 -->
    <div class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center shrink-0">
      <span class="text-xs font-bold tracking-wider text-[#2d2b28]">// 인맥_주소록.sh</span>
      <button 
        @click="modalStore.openModal('addFriend')"
        class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-0.5 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        + 등록
      </button>
    </div>

    <!-- 메뉴 외부 클릭 시 닫기 위한 오버레이 -->
    <div v-if="activeMenuId" @click="closeMenu" class="fixed inset-0 z-40"></div>

    <!-- 친구 목록 영역 -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3 z-50 relative custom-scrollbar">
      
      <!-- ● 친구 요청 타이틀 -->
      <div v-if="reqFriends.length > 0">
        <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-2">
          ● 친구 요청
        </div>

        <div class="space-y-2">
          <div
            v-for="friend in reqFriends"
            :key="friend.id"
            class="group flex items-center gap-2.5 p-2 bg-[#f4f1eb] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28]"
          >
            <!-- 아바타 -->
            <div class="w-7 h-7 bg-[#2d2b28] flex items-center justify-center border border-[#2d2b28] shrink-0">
              <img
                :src="`https://flagcdn.com/w40/${friend.flag}.png`"
                alt=""
                class="w-4 h-3 object-cover"
              />
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

            <div class="flex gap-1 shrink-0">
              <button
                v-if="friend.status == 'SENT'"
                @click="friendStore.declinedFriendRequest(friend.id, true)"
                class="bg-amber-500 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-amber-600 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
              >
                취소
              </button>

              <template v-else-if="friend.status == 'RECEIVED'">
                <button
                  @click="friendStore.acceptFriendRequest(friend.id)"
                  class="bg-emerald-600 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-emerald-700 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
                >
                  수락
                </button>
                <button
                  @click="friendStore.declinedFriendRequest(friend.id, false)"
                  class="bg-rose-600 text-white border border-[#2d2b28] text-[9px] px-1.5 py-0.5 font-bold hover:bg-rose-700 transition-colors shadow-[1px_1px_0px_0px_#2d2b28]"
                >
                  거절
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ● 온라인 인맥 타이틀 -->
      <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-4 mb-2">
        ● 온라인 인맥
      </div>
      
      <!-- 온라인 인맥 리스트 -->
      <div class="space-y-2">
        <div 
          v-for="friend in onlineList" 
          :key="friend.id"
          class="border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] transition-all bg-[#f4f1eb] overflow-hidden"
          :class="activeMenuId === friend.id ? 'ring-1 ring-[#2d2b28]' : ''"
        >
          <!-- 프로필 메인 바 -->
          <div 
            @click="toggleMenu(friend.id)"
            @dblclick="!friend.isMe && friend.id && uiStore.changeChatRoomTab(true, [friend.id], friend.name)"
            class="group flex items-center gap-2.5 p-2 cursor-pointer transition-colors relative"
            :class="activeMenuId === friend.id ? 'bg-[#3d3a36] text-[#fbf9f5]' : 'hover:bg-[#e8e3d8] text-[#2d2b28]'"
          >
            <!-- 아바타 -->
            <div
              @click.stop="friend.isMe && modalStore.openModal('selectCountry')"
              class="group/avatar relative w-7 h-7 bg-[#2d2b28] flex items-center justify-center border border-[#2d2b28] shrink-0 font-pixel text-lg select-none transition-colors"
              :class="friend.isMe ? 'cursor-pointer hover:bg-[#5c5851]' : ''"
            >
              <span class="transition-opacity" :class="friend.isMe ? 'group-hover/avatar:opacity-30' : ''">
                <img 
                  :src="`https://flagcdn.com/w40/${friend.isMe ? friend.flag : 'kr'}.png`"
                  alt=""
                  class="w-4 h-3 object-cover flex-shrink-0"
                />
              </span>
              <span
                v-if="friend.isMe"
                class="absolute inset-0 hidden group-hover/avatar:flex items-center justify-center text-white text-xs font-bold pointer-events-none"
              >
                +
              </span>
            </div>
            
            <!-- 이름 및 상태메시지 -->
            <div v-if="authStore.userInfo" class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-emerald-500 inline-block rounded-full"></span>
                <span class="text-xs font-bold truncate tracking-tight">{{ friend.name }}</span>
                <span v-if="friend.isMe" class="text-[9px] px-1 py-0.2 bg-[#c5bfb6] text-[#2d2b28] font-bold border border-[#2d2b28]">ME</span>
              </div>
              <div 
                class="text-[9px] truncate mt-0.5"
                :class="activeMenuId === friend.id ? 'text-[#c5bfb6]' : 'text-neutral-500'"
              >
                {{ friend.statusMsg || '상태 메시지가 없습니다.' }}
              </div>
            </div>

            <!-- 토글 화살표 표시 -->
            <div class="text-[8px] opacity-60 px-1">
              <span v-if="activeMenuId === friend.id">▲</span>
              <span v-else class="group-hover:translate-y-0.5 inline-block transition-transform">▼</span>
            </div>
          </div>

          <!-- 레트로 하위 서브메뉴 탭 (아코디언) -->
          <Transition name="accordion">
            <div 
              v-if="activeMenuId === friend.id"
              class="flex bg-[#2d2b28] text-[#fbf9f5] text-[10px] font-bold border-t-2 border-[#2d2b28] divide-x divide-[#4a4641]"
            >
              <template v-if="friend.isMe">
                <button 
                  @click.stop="handleMyProfileMenu('editBio')" 
                  class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                >
                  <span>✎</span> 소개글
                </button>
                <button 
                  @click.stop="handleMyProfileMenu('editStatus')" 
                  class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                >
                  <span>💬</span> 상태메시지
                </button>
                <button 
                  @click.stop="handleMyProfileMenu('goOffline')" 
                  class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                >
                  <span>🌙</span> 오프라인
                </button>
              </template>
              
              <template v-else>
                <button 
                  @click.stop="handleOtherProfileMenu('viewBio', friend.id)" 
                  class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                >
                  <span>📄</span> 소개글
                </button>
                <button 
                  @click.stop="handleOtherProfileMenu('block', friend.id)" 
                  class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
                >
                  <span>🚫</span> 차단
                </button>
                <button 
                  @click.stop="handleOtherProfileMenu('delete', friend.id)" 
                  class="flex-1 py-1.5 px-1 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors flex items-center justify-center gap-1"
                >
                  <span>✕</span> 삭제
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </div>

      <!-- ○ 오프라인 인맥 타이틀 -->
      <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-5 mb-2">
        ○ 오프라인 인맥
      </div>
      
      <!-- 오프라인 친구 리스트 -->
      <div class="space-y-2">
        <div 
          v-for="friend in friendStore.offlineFriends" 
          :key="friend.id"
          class="border-2 border-transparent transition-all bg-[#d1cbc1] opacity-70 hover:opacity-100 hover:border-[#2d2b28] hover:shadow-[3px_3px_0px_0px_#2d2b28] overflow-hidden"
          :class="activeMenuId === friend.id ? 'opacity-100 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] !bg-[#f4f1eb]' : ''"
        >
          <div 
            @click="toggleMenu(friend.id)"
            class="flex items-center gap-2.5 p-2 cursor-pointer group transition-colors"
            :class="activeMenuId === friend.id ? 'bg-[#3d3a36] text-[#fbf9f5]' : 'hover:bg-[#e8e3d8] text-[#5c5851]'"
          >
            <!-- 아바타 -->
            <div class="w-7 h-7 bg-neutral-400 text-neutral-200 flex items-center justify-center shrink-0 border border-[#2d2b28] filter grayscale group-hover:grayscale-0">
              <img 
                :src="`https://flagcdn.com/w40/${'kr'}.png`"
                alt=""
                class="w-4 h-3 object-cover"
              />
            </div>
            
            <!-- 이름 및 상태메시지 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-neutral-400 group-hover:bg-neutral-500 inline-block rounded-full"></span>
                <span class="text-xs font-bold truncate" :class="activeMenuId === friend.id ? 'text-[#fbf9f5]' : 'text-[#5c5851] group-hover:text-[#2d2b28]'">
                  {{ friend.name }}
                </span>
              </div>
              <div 
                class="text-[9px] truncate mt-0.5"
                :class="activeMenuId === friend.id ? 'text-[#c5bfb6]' : 'text-neutral-500'"
              >
                {{ friend.statusMsg || '오프라인' }}
              </div>
            </div>

            <div class="text-[8px] opacity-60 px-1">
              <span v-if="activeMenuId === friend.id">▲</span>
              <span v-else class="group-hover:translate-y-0.5 inline-block transition-transform">▼</span>
            </div>
          </div>

          <!-- 오프라인 서브메뉴 탭 -->
          <Transition name="accordion">
            <div 
              v-if="activeMenuId === friend.id"
              class="flex bg-[#2d2b28] text-[#fbf9f5] text-[10px] font-bold border-t-2 border-[#2d2b28] divide-x divide-[#4a4641]"
            >
              <button 
                @click.stop="handleOtherProfileMenu('viewBio', friend.id)" 
                class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
              >
                <span>📄</span> 소개글
              </button>
              <button 
                @click.stop="handleOtherProfileMenu('block', friend.id)" 
                class="flex-1 py-1.5 px-1 hover:bg-[#e6c875] hover:text-[#2d2b28] transition-colors flex items-center justify-center gap-1"
              >
                <span>🚫</span> 차단
              </button>
              <button 
                @click.stop="handleOtherProfileMenu('delete', friend.id)" 
                class="flex-1 py-1.5 px-1 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors flex items-center justify-center gap-1"
              >
                <span>✕</span> 삭제
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
      
    <FriendModal/>
    <CountryModal/>
    <EditBioModal/>
    <ViewBioModal/>
  </section>
</template>

<style scoped>
/* 레트로 서브메뉴 아코디언 애니메이션 */
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