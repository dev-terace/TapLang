<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n' // i18n 추가
import { useUIStore } from '@/shared/ui/UiStore'
import { useCustomChatStore } from '../stores/CustomChatStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import CustomChatCreateModal from './CustomChatCreateModal.vue'
import { useCustomChatList } from '../composable/CustomChat.vue/useCustomChatList'
import { useInfiniteScroll } from '@/shared/ui/composables/useInfiniteScroll'

// i18n t 함수 초기화
const { t } = useI18n()

const uiStore = useUIStore()
const modalStore = useModalStore()
const customChatStore = useCustomChatStore()

const {
  isLoading,
  nextCursor,
  myNextCursor,
  roomListMode,
  changeRoomListMode,
  loadMoreCustomChats,
  enterCustomRoom,
  handleCustomRoomClick,
  refreshCustomChats,
} = useCustomChatList()

const hasMore = computed(() =>
  roomListMode.value === 'my' ? !!myNextCursor.value : !!nextCursor.value
)

const scrollContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const { setup: setupObserver, teardown: teardownObserver } = useInfiniteScroll({
  container: scrollContainer,
  sentinel: loadMoreTrigger,
  hasMore: () => hasMore.value,
  isLoading: () => isLoading.value,
  loadMore: () => loadMoreCustomChats(),
  preserveScroll: false,
  debugLabel: 'customChatList',
})

watch(
  () => isLoading.value,
  (loading) => {
    if (!loading && uiStore.currentTab === 'customChat') {
      setupObserver()
    }
  }
)

watch(
  () => uiStore.currentTab,
  (tab) => {
    if (tab !== 'customChat') {
      teardownObserver()
    }
  }
)
</script>

<template>
  <div v-if="uiStore.currentTab === 'customChat'" class="flex-1 flex flex-col h-full">

    <!-- Header -->
    <div class="p-6 border-b-2 border-dashed border-[#2d2b28]">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-base tracking-wider">
            // {{ t('customChat.title') }}
          </h3>

          <p class="text-[10px] text-neutral-500">
            {{ t('customChat.description') }}
          </p>
        </div>

        <div class="flex gap-2">
          <!-- 새로고침 -->
          <button type="button" :disabled="isLoading" @click="refreshCustomChats"
            class="bg-[#f4f1eb] text-[#2d2b28] hover:bg-[#2d2b28] hover:text-white border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all disabled:opacity-50">
            {{ isLoading ? t('customChat.refreshLoading') : t('customChat.refresh') }}
          </button>

          <!-- 방 개설 -->
          <button type="button" @click="modalStore.openModal('customChatCreate')"
            class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none">
            {{ t('customChat.createRoom') }}
          </button>
        </div>
      </div>

      <!-- Filter -->
      <div class="flex gap-2 mt-6">
        <button type="button" @click="changeRoomListMode('my')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
          roomListMode === 'my'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          {{ t('customChat.filter.my') }}
        </button>

        <button type="button" @click="changeRoomListMode('all')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
          roomListMode === 'all'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          {{ t('customChat.filter.all') }}
        </button>

        <button type="button" @click="changeRoomListMode('secret')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
          roomListMode === 'secret'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          {{ t('customChat.filter.secret') }}
        </button>
      </div>
    </div>

    <!-- Room List (스크롤 컨테이너) -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]">

      <!-- 최초 로딩 -->
      <div v-if="isLoading && customChatStore.filteredCustomRooms.length === 0"
        class="text-center text-xs text-neutral-500 py-10 font-bold">
        {{ t('customChat.status.loadingInitial') }}
      </div>

      <!-- 목록 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div v-for="room in customChatStore.filteredCustomRooms" :key="room.id"
          class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"
          @click="handleCustomRoomClick(room)" @dblclick="enterCustomRoom(room)">
          <div>
            <div class="flex justify-between items-start gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span v-if="room.isSecret" class="text-xs bg-red-600 text-white px-1 font-pixel">
                  🔒
                </span>
                <span v-else class="text-xs bg-blue-600 text-white px-1 font-pixel">
                  🌐
                </span>
                <span class="text-xs font-bold text-[#2d2b28] tracking-tight">
                  {{ room.title }}
                </span>
              </div>
            </div>

            <p class="text-[10px] text-neutral-500 mt-2">
              {{ room.desc }}
            </p>
          </div>

          <div
            class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4">
            <span>{{ t('customChat.roomCard.owner', { owner: room.owner }) }}</span>
            <span>{{ t('customChat.roomCard.members', { count: room.members }) }}</span>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="customChatStore.filteredCustomRooms.length === 0 && !isLoading"
          class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]">
          {{ t('customChat.status.empty') }}
        </div>

        <!-- 무한 스크롤 트리거 (버튼 없음) -->
        <div ref="loadMoreTrigger" class="col-span-1 md:col-span-2 flex justify-center py-4">
          <span v-if="isLoading && customChatStore.filteredCustomRooms.length > 0"
            class="text-xs text-neutral-500 font-bold">
            {{ t('customChat.status.loadingMore') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <CustomChatCreateModal />
  </div>
</template>