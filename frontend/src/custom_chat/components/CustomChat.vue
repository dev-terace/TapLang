<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useCustomChatStore } from '../stores/CustomChatStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import CustomChatCreateModal from './CustomChatCreateModal.vue'

// 만든 Composable import (경로는 실제 파일 위치에 맞게 수정해주세요)
import { useCustomChatList } from '../composable/CustomChat.vue/useCustomChatList'

const uiStore = useUIStore()
const modalStore = useModalStore()
const customChatStore = useCustomChatStore()

// Composable에서 필요한 상태와 메서드를 가져옵니다.
const {
  isLoading,
  nextCursor,
  myNextCursor,
  roomListMode,
  changeRoomListMode,
  loadMoreCustomChats,
  enterCustomRoom,
  handleCustomRoomClick
} = useCustomChatList()

</script>

<template>
  <div v-if="uiStore.currentTab === 'customChat'" class="flex-1 flex flex-col h-full">

    <!-- =====================================================
         Header
    ====================================================== -->
    <div class="p-6 border-b-2 border-dashed border-[#2d2b28]">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-base tracking-wider">
            // 사설_대화방_목록.net
          </h3>
          <p class="text-[10px] text-neutral-500">
            유저들이 생성한 커스텀 채널 목록입니다.
          </p>
        </div>

        <!-- 방 생성 -->
        <button 
          type="button" 
          @click="modalStore.openModal('customChatCreate')"
          class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none"
        >
          + 사설방 개설
        </button>
      </div>

      <!-- ===================================================
           Filter
      ==================================================== -->
      <div class="flex gap-2 mt-6">
        <!-- 내가 참여한 방 -->
        <button 
          type="button" 
          @click="changeRoomListMode('my')" 
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
            roomListMode === 'my'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          내가 참여한 방
        </button>

        <!-- 전체 -->
        <button 
          type="button" 
          @click="changeRoomListMode('all')" 
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
            roomListMode === 'all'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          전체 사설 대화방
        </button>

        <!-- 비밀방 -->
        <button 
          type="button" 
          @click="changeRoomListMode('secret')" 
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
            roomListMode === 'secret'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          🔒 비밀 대화방
        </button>
      </div>
    </div>

    <!-- =====================================================
         Room List
    ====================================================== -->
    <div class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]">
      
      <!-- 최초 로딩 -->
      <div 
        v-if="isLoading && customChatStore.filteredCustomRooms.length === 0" 
        class="text-center text-xs text-neutral-500 py-10 font-bold"
      >
        사설 대화방을 불러오는 중...
      </div>

      <!-- 목록 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- =================================================
             Custom Room
        ================================================== -->
        <div 
          v-for="room in customChatStore.filteredCustomRooms" 
          :key="room.id"
          class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"
          @click="handleCustomRoomClick(room)" 
          @dblclick="enterCustomRoom(room)"
        >
          <!-- Room Info -->
          <div>
            <div class="flex justify-between items-start gap-2 mb-2">
              <div class="flex items-center gap-2">
                <!-- Secret -->
                <span v-if="room.isSecret" class="text-xs bg-red-600 text-white px-1 font-pixel">
                  🔒
                </span>
                
                <!-- Public -->
                <span v-else class="text-xs bg-blue-600 text-white px-1 font-pixel">
                  🌐
                </span>

                <!-- Title -->
                <span class="text-xs font-bold text-[#2d2b28] tracking-tight">
                  {{ room.title }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-[10px] text-neutral-500 mt-2">
              {{ room.desc }}
            </p>
          </div>

          <!-- =================================================
               Room Footer
          ================================================== -->
          <div class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4">
            <span>방장: {{ room.owner }}</span>
            <span>인원: {{ room.members }}명</span>
          </div>
        </div>

        <!-- =================================================
             Empty
        ================================================== -->
        <div 
          v-if="customChatStore.filteredCustomRooms.length === 0 && !isLoading"
          class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]"
        >
          해당 조건의 사설 대화방이 존재하지 않습니다.
        </div>

        <!-- =================================================
             Load More
        ================================================== -->
        <div 
          v-if="roomListMode === 'my' ? myNextCursor : nextCursor" 
          class="col-span-1 md:col-span-2 flex justify-center py-4"
        >
          <button 
            type="button" 
            :disabled="isLoading" 
            @click="loadMoreCustomChats"
            class="px-5 py-2 text-xs font-bold border-2 border-[#2d2b28] bg-[#e6e2db] hover:bg-[#2d2b28] hover:text-white disabled:opacity-50 transition-all"
          >
            {{ isLoading ? '불러오는 중...' : '더 보기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- =====================================================
         Create Modal
    ====================================================== -->
    <CustomChatCreateModal />
  </div>
</template>