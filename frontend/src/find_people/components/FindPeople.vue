<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import { useChatNavigation } from '@/chat/composables/chatRoom.vue/useChatNavigation'
import { findPeopleApi, type FindPeopleUser } from '@/find_people/api/findPeople.api'

const uiStore = useUIStore()
const modalStore = useModalStore()
const { openDirectChatWithUser } = useChatNavigation()

// 목록 및 페이지네이션 상태
const users = ref<FindPeopleUser[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)

/**
 * 특정 페이지의 탐색자 목록 조회
 */
const fetchPeople = async (page: number = 1) => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    currentPage.value = page

    const res = await findPeopleApi.getPeopleList({
      page: page,
      limit: 20,
    })

    users.value = res.items
    totalPages.value = res.meta.totalPages || 1
  } catch (error) {
    console.error('탐색자 목록 로딩 실패:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 페이지 이동
 */
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  fetchPeople(page)
}

/**
 * 화면에 표시할 숫자 페이지 배열 계산 (최대 5개 노출)
 */
const visiblePages = computed(() => {
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1

  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

/**
 * ViewBioModal 오픈 연동
 */
const handleOpenViewBio = (userId: number | string) => {
  uiStore.profileMenuFriendId = String(userId)
  modalStore.openModal('viewBio')
}

/**
 * 1:1 채팅 시작
 */
const handleStartChat = (user: FindPeopleUser) => {
  openDirectChatWithUser(String(user.id), user.name)
}

onMounted(() => {
  fetchPeople(1)
})
</script>

<template>
  <div v-if="uiStore.currentTab === 'findPeople'" class="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
    <div>
      <!-- 헤더 영역 -->
      <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-base tracking-wider">// 사람찾기_디렉토리.net</h3>
          <p class="text-[10px] text-neutral-500">글로벌 서버의 접속자를 탐색합니다.</p>
        </div>
        <button 
          @click="fetchPeople(currentPage)" 
          class="border-2 border-[#2d2b28] bg-white text-[10px] px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all shadow-[2px_2px_0px_0px_#2d2b28]"
        >
          🔄 새로고침
        </button>
      </div>

      <!-- 로딩 중 상태 -->
      <div v-if="isLoading" class="py-16 text-center text-xs font-bold animate-pulse text-[#2d2b28]">
        > 데이터 동기화 중...
      </div>

      <!-- 탐색자 카드리스트 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="p-3 bg-[#f4f1eb] border-2 border-[#2d2b28] flex justify-between items-center shadow-[3px_3px_0px_0px_#2d2b28]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 bg-[#2d2b28] text-white flex items-center justify-center font-pixel text-lg border-2 border-[#2d2b28] shrink-0">
               <img
              :src="`https://flagcdn.com/w40/${user.flag}.png`"
              alt=""
              class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
            />
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold truncate">{{ user.name }}</div>
              <div class="text-[9px] text-neutral-500 truncate">
                {{ user.statusMsg || '상태 메시지가 없습니다.' }}
              </div>
            </div>
          </div>

          <div class="flex gap-1.5 items-center shrink-0">
            <button 
              @click="handleOpenViewBio(user.id)" 
              class="border-2 border-[#2d2b28] bg-white text-[10px] px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all whitespace-nowrap"
            >
              소개글 보기
            </button>
            <button 
              @click="handleStartChat(user)" 
              class="border-2 border-[#2d2b28] bg-white text-[10px] px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all whitespace-nowrap"
            >
              채팅하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 💡 숫자 페이지네이션 컨트롤러 -->
    <div v-if="totalPages > 0" class="mt-8 flex justify-center items-center gap-1.5 select-none pb-2">
      <!-- 이전 페이지 버튼 -->
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="border-2 border-[#2d2b28] bg-white px-2 py-1 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2d2b28] hover:text-white shadow-[2px_2px_0px_0px_#2d2b28] transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        ◀
      </button>

      <!-- 숫자 페이지 버튼 -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        class="w-7 h-7 flex items-center justify-center border-2 border-[#2d2b28] text-xs font-bold shadow-[2px_2px_0px_0px_#2d2b28] transition-all active:translate-x-[1px] active:translate-y-[1px]"
        :class="[
          page === currentPage 
            ? 'bg-[#2d2b28] text-white' 
            : 'bg-white text-[#2d2b28] hover:bg-[#2d2b28] hover:text-white'
        ]"
      >
        {{ page }}
      </button>

      <!-- 다음 페이지 버튼 -->
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="border-2 border-[#2d2b28] bg-white px-2 py-1 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2d2b28] hover:text-white shadow-[2px_2px_0px_0px_#2d2b28] transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        ▶
      </button>
    </div>
  </div>
</template>