<script setup lang="ts">
import { ref, watch } from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'
import { useCustomChatStore } from '../stores/CustomChatStore'
import { useModalStore } from '@/shared/modal/ModalStore'
import { customChatApi } from '../api/customChat.api'
import CustomChatCreateModal from './CustomChatCreateModal.vue'
import { useCustomChatRoom } from '../composable/useCustomChatRoom'
const uiStore = useUIStore()
const modalStore = useModalStore()
const customChatStore = useCustomChatStore()
const isLoading = ref(false)

// 다음 페이지 cursor
const nextCursor =
  ref<customChatApi.CustomChatCursor | null>(null)

const myNextCursor =
  ref<customChatApi.MyCustomChatCursor | null>(null)



type RoomListMode =
  | 'all'
  | 'secret'
  | 'my'

const roomListMode =
  ref<RoomListMode>('all')


// =========================================================
// CUSTOM 채팅방 목록 조회
// =========================================================

const loadCustomChats = async (
  loadMore = false
) => {

  if (isLoading.value) {
    return
  }

  if (
    loadMore &&
    !nextCursor.value
  ) {
    return
  }

  isLoading.value = true

  try {

    const response =
      await customChatApi.getCustomChats(
        loadMore
          ? nextCursor.value ?? undefined
          : undefined
      )

    if (loadMore) {

      customChatStore.addCustomRooms(
        response.items
      )

    } else {

      customChatStore.setCustomRooms(
        response.items
      )

    }

    nextCursor.value =
      response.nextCursor

  } catch (error) {

    console.error(
      'CUSTOM 채팅방 목록 조회 실패:',
      error
    )

    window.alert(
      error instanceof Error
        ? error.message
        : '사설 대화방 목록을 불러오지 못했습니다.'
    )

  } finally {

    isLoading.value = false

  }
}


const loadMyCustomChats = async (
  loadMore = false
) => {

  if (
    loadMore &&
    !myNextCursor.value
  ) {
    return
  }

  try {

    isLoading.value = true

    const response =
      await customChatApi.getMyCustomChats(
        loadMore
          ? myNextCursor.value ?? undefined
          : undefined
      )


    console.log(
      '내 CUSTOM 채팅방:',
      response
    )


    // =====================================================
    // 첫 조회
    // =====================================================

    if (!loadMore) {

      customChatStore.setJoinedCustomRooms(
        response.items
      )

    }

    // =====================================================
    // 다음 페이지
    // =====================================================

    else {

      customChatStore.addJoinedCustomRooms(
        response.items
      )

    }


    // =====================================================
    // 다음 Cursor
    // =====================================================

    myNextCursor.value =
      response.nextCursor

  } catch (error) {

    console.error(
      '내 CUSTOM 채팅방 조회 실패:',
      error
    )

  } finally {

    isLoading.value = false

  }
}


const changeRoomListMode = async (
  mode: RoomListMode
) => {

  if (isLoading.value) {
    return
  }

  roomListMode.value = mode

  customChatStore.changeCustomFilter(
    mode
  )


  // =====================================================
  // 내가 참여한 방
  // =====================================================

  if (mode === 'my') {

    myNextCursor.value = null

    customChatStore.setJoinedCustomRooms([])

    await loadMyCustomChats()

    return
  }


  // =====================================================
  // 전체 / 비밀방
  // =====================================================

  nextCursor.value = null

  customChatStore.setCustomRooms([])

  await loadCustomChats()
}


// =========================================================
// groupChat 탭이 열릴 때 조회
// =========================================================

watch(
  () => uiStore.currentTab,
  (tab) => {

    if (tab !== 'customChat') {
      return
    }

    roomListMode.value = 'all'

    customChatStore.changeCustomFilter(
      'all'
    )

    nextCursor.value = null
    myNextCursor.value = null

    customChatStore.setCustomRooms([])

    loadCustomChats()

  },
  {
    immediate: true,
  }
)

// =========================================================
// 다음 30개 불러오기
// =========================================================

const loadMoreCustomChats = () => {

  if (isLoading.value) {
    return
  }


  // =====================================================
  // 내가 참여한 방
  // =====================================================

  if (roomListMode.value === 'my') {

    if (!myNextCursor.value) {
      return
    }

    loadMyCustomChats(true)

    return
  }


  // =====================================================
  // 전체 / 비밀방
  // =====================================================

  if (!nextCursor.value) {
    return
  }

  loadCustomChats(true)
}


const enterCustomRoom = async (
  room: customChatStore.CustomRoom,
  password?: string
) => {

  if (isLoading.value) {
    return false
  }

  try {

    isLoading.value = true

    // =====================================================
    // 비밀방이면 비밀번호 검증
    // =====================================================

    if (room.isSecret) {

      if (!password) {
        return false
      }

    }

    // =====================================================
    // 현재 CUSTOM 방 저장
    // =====================================================

    customChatStore.setCurrentRoom(room)
    // =====================================================
    // 현재 conversation password
    // =====================================================
    customChatStore.setPassword(password)


    uiStore.conversationId =
      room.id


    // =====================================================
    // CUSTOM 채팅방 화면으로 이동
    // =====================================================

    uiStore.currentTab =
      'customChatRoom'

    return true

  } catch (error) {

    console.error(
      '[CUSTOM ROOM] 입장 실패:',
      error
    )

    return false

  } finally {

    isLoading.value = false

  }
}


const handleCustomRoomClick = async (
  room: customChatStore.CustomRoom
) => {
  let password: string | undefined



  console.log("handleCustomRoomClick room id", room.id);
  //사용자가 현재 방 소유인지 확인하기 api const isMember = true
  //enter customRoom api
  if (room.isSecret) {
    password = window.prompt(
      `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 비밀번호를 입력하세요:`
    ) ?? undefined

    if (!password) {
      return
    }
  }

  await enterCustomRoom(
    room,
    password
  )
}
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

        <button type="button" @click="
          modalStore.openModal(
            'customChatCreate'
          )
          "
          class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none">
          + 사설방 개설
        </button>

      </div>


      <!-- ===================================================
           Filter
      ==================================================== -->

      <div class="flex gap-2 mt-6">

        <!-- 내가 참여한 방 -->

        <button type="button" @click="changeRoomListMode('my')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',

          roomListMode === 'my'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          내가 참여한 방
        </button>


        <!-- 전체 -->

        <button type="button" @click="changeRoomListMode('all')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',

          roomListMode === 'all'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          전체 사설 대화방
        </button>


        <!-- 비밀방 -->

        <button type="button" @click="changeRoomListMode('secret')" :class="[
          'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',

          roomListMode === 'secret'
            ? 'bg-[#2d2b28] text-white'
            : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
        ]">
          🔒 비밀 대화방
        </button>

      </div>

    </div>


    <!-- =====================================================
         Room List
    ====================================================== -->

    <div class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]">

      <!-- 최초 로딩 -->

      <div v-if="
        isLoading &&
        customChatStore.filteredCustomRooms.length === 0
      " class="text-center text-xs text-neutral-500 py-10 font-bold">
        사설 대화방을 불러오는 중...
      </div>


      <!-- 목록 -->

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- =================================================
             Custom Room
        ================================================== -->

        <div v-for="
room in customChatStore.filteredCustomRooms
          " :key="room.id"
          class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"
          @click="
            handleCustomRoomClick(
              room
            )
            " @dblclick="
              enterCustomRoom(room)
              ">

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

          <div
            class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4">

            <!-- Owner -->

            <span>
              방장: {{ room.owner }}
            </span>


            <!-- Members -->

            <span>
              인원: {{ room.members }}명
            </span>

          </div>

        </div>


        <!-- =================================================
             Empty
        ================================================== -->

        <div v-if="
          customChatStore.filteredCustomRooms.length === 0 &&
          !isLoading
        "
          class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]">
          해당 조건의 사설 대화방이 존재하지 않습니다.
        </div>


        <!-- =================================================
             Load More
        ================================================== -->

        <div v-if="
          roomListMode === 'my'
            ? myNextCursor
            : nextCursor
        " class="col-span-1 md:col-span-2 flex justify-center py-4">

          <button type="button" :disabled="isLoading" @click="loadMoreCustomChats"
            class="px-5 py-2 text-xs font-bold border-2 border-[#2d2b28] bg-[#e6e2db] hover:bg-[#2d2b28] hover:text-white disabled:opacity-50 transition-all">

            {{
              isLoading
                ? '불러오는 중...'
                : '더 보기'
            }}

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