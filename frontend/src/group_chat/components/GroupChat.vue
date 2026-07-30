<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useGroupChatStore } from '../stores/GroupChatStore'

const uiStore = useUIStore()
const groupChatStore = useGroupChatStore()


const alert = (message: string): void => {
  window.alert(message)
}

</script>


<template>
  <div
    v-if="uiStore.currentTab === 'groupChat'"
    class="flex-1 flex flex-col h-full"
  >

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


        <button
          @click="alert('사설방 개설 기능은 준비 중입니다.')"
          class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none"
        >
          + 사설방 개설
        </button>

      </div>


      <div class="flex gap-2 mt-6">

        <button
          @click="groupChatStore.changePrivateFilter('all')"
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
            groupChatStore.privateFilter === 'all'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          전체 사설 대화방
        </button>


        <button
          @click="groupChatStore.changePrivateFilter('secret')"
          :class="[
            'px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all',
            groupChatStore.privateFilter === 'secret'
              ? 'bg-[#2d2b28] text-white'
              : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]'
          ]"
        >
          🔒 비밀 대화방
        </button>

      </div>

    </div>



    <div class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div
          v-for="room in groupChatStore.filteredPrivateRooms"
          :key="room.id"

          class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"

          @click="groupChatStore.handlePrivateRoomClick(room)"
        >

          <div>

            <div class="flex justify-between items-start gap-2 mb-2">

              <div class="flex items-center gap-2">

                <span
                  v-if="room.isSecret"
                  class="text-xs bg-red-600 text-white px-1 font-pixel"
                >
                  🔒
                </span>

                <span
                  v-else
                  class="text-xs bg-blue-600 text-white px-1 font-pixel"
                >
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
            class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4"
          >
            <span>
              방장: {{ room.owner }}
            </span>

            <span>
              인원: {{ room.members }}명
            </span>

          </div>


        </div>



        <div
          v-if="groupChatStore.filteredPrivateRooms.length === 0"
          class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]"
        >
          해당 조건의 사설 대화방이 존재하지 않습니다.
        </div>


      </div>

    </div>

  </div>
</template>