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


// =========================================================
// CUSTOM 채팅방 목록 조회
// =========================================================

const loadCustomChats = async (
  loadMore = false
) => {

  if (isLoading.value) {
    return
  }

  // 더 불러오기인데 cursor가 없으면 종료
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

    
    console.log(
      'CUSTOM 채팅방 목록:',
      response
    )


    // =======================================================
    // API 응답은 이미 CustomRoom 형태이므로
    // 별도 변환 필요 없음
    // =======================================================

    if (loadMore) {

      // 다음 30개 추가
      customChatStore.addCustomRooms(
        response.items
      )

    } else {

      // 첫 조회
      customChatStore.setCustomRooms(
        response.items
      )

    }


    // =======================================================
    // 다음 Cursor 저장
    // =======================================================

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


// =========================================================
// groupChat 탭이 열릴 때 조회
// =========================================================

watch(
  () => uiStore.currentTab,

  (tab) => {

    if (tab !== 'groupChat') {
      return
    }


    // =======================================================
    // 탭을 다시 열면 첫 페이지부터
    // =======================================================

    nextCursor.value = null

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

  if (
    isLoading.value ||
    !nextCursor.value
  ) {
    return
  }

  loadCustomChats(true)
}


const {
  enterCustomRoom,
  isProcessing
} = useCustomChatRoom({
  scrollToBottom: () => {}
})


const handleCustomRoomClick = async (
  room: customChatStore.CustomRoom
) => {
  let password: string | undefined

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

  <div
    v-if="uiStore.currentTab === 'groupChat'"
    class="flex-1 flex flex-col h-full"
  >

    <!-- =====================================================
         Header
    ====================================================== -->

    <div
      class="p-6 border-b-2 border-dashed border-[#2d2b28]"
    >

      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >

        <div>

          <h3
            class="font-bold text-base tracking-wider"
          >
            // 사설_대화방_목록.net
          </h3>

          <p
            class="text-[10px] text-neutral-500"
          >
            유저들이 생성한 커스텀 채널 목록입니다.
          </p>

        </div>


        <!-- 방 생성 -->

        <button
          type="button"
          @click="
            modalStore.openModal(
              'customChatCreate'
            )
          "
          class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none"
        >
          + 사설방 개설
        </button>

      </div>


      <!-- ===================================================
           Filter
      ==================================================== -->

      <div class="flex gap-2 mt-6">

        <!-- 전체 -->

        <button
          type="button"
          @click="
            customChatStore.changeCustomFilter(
              'all'
            )
          "
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',

            customChatStore.customFilter === 'all'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          전체 사설 대화방
        </button>


        <!-- 비밀방 -->

        <button
          type="button"
          @click="
            customChatStore.changeCustomFilter(
              'secret'
            )
          "
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',

            customChatStore.customFilter === 'secret'
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

    <div
      class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]"
    >

      <!-- 최초 로딩 -->

      <div
        v-if="
          isLoading &&
          customChatStore.filteredCustomRooms.length === 0
        "
        class="text-center text-xs text-neutral-500 py-10 font-bold"
      >
        사설 대화방을 불러오는 중...
      </div>


      <!-- 목록 -->

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        <!-- =================================================
             Custom Room
        ================================================== -->

        <div
          v-for="
            room in customChatStore.filteredCustomRooms
          "
          :key="room.id"

          class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"

          @click="
            handleCustomRoomClick(
              room
            )
          "
            @dblclick="
    enterCustomRoom(room)
  "
        >

          <!-- Room Info -->

          <div>

            <div
              class="flex justify-between items-start gap-2 mb-2"
            >

              <div
                class="flex items-center gap-2"
              >

                <!-- Secret -->

                <span
                  v-if="room.isSecret"
                  class="text-xs bg-red-600 text-white px-1 font-pixel"
                >
                  🔒
                </span>


                <!-- Public -->

                <span
                  v-else
                  class="text-xs bg-blue-600 text-white px-1 font-pixel"
                >
                  🌐
                </span>


                <!-- Title -->

                <span
                  class="text-xs font-bold text-[#2d2b28] tracking-tight"
                >
                  {{ room.title }}
                </span>

              </div>

            </div>


            <!-- Description -->

            <p
              class="text-[10px] text-neutral-500 mt-2"
            >
              {{ room.desc }}
            </p>

          </div>


          <!-- =================================================
               Room Footer
          ================================================== -->

          <div
            class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4"
          >

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

        <div
          v-if="
            customChatStore.filteredCustomRooms.length === 0 &&
            !isLoading
          "
          class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]"
        >
          해당 조건의 사설 대화방이 존재하지 않습니다.
        </div>


        <!-- =================================================
             Load More
        ================================================== -->

        <div
          v-if="nextCursor"
          class="col-span-1 md:col-span-2 flex justify-center py-4"
        >

          <button
            type="button"

            :disabled="isLoading"

            @click="loadMoreCustomChats"

            class="px-5 py-2 text-xs font-bold border-2 border-[#2d2b28] bg-[#e6e2db] hover:bg-[#2d2b28] hover:text-white disabled:opacity-50 transition-all"
          >

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