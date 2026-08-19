import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


// =========================================================
// CUSTOM 채팅방
// =========================================================

export interface CustomRoom {

  id: string

  title: string
  desc: string

  ownerId: number
  owner: string

  members: number

  isSecret: boolean

  type: 'CUSTOM'

  lastMessageAt: string | null
  createdAt: string
}


// =========================================================
// Store
// =========================================================

export const useCustomChatStore = defineStore(
  'customChat',
  () => {

    // =======================================================
    // 필터
    // =======================================================

    const customFilter =
      ref<'all' | 'secret'>('all')


    // =======================================================
    // CUSTOM 채팅방 목록
    // =======================================================

    const customRooms =
      ref<CustomRoom[]>([])


    // =======================================================
    // 전체 목록 교체
    // =======================================================

    const setCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      customRooms.value = rooms
    }


    // =======================================================
    // 다음 페이지 추가
    // =======================================================

    const addCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      customRooms.value.push(...rooms)
    }


    // =======================================================
    // 필터 변경
    // =======================================================

    const changeCustomFilter = (
      filter: 'all' | 'secret'
    ) => {

      customFilter.value = filter
    }


    // =======================================================
    // 필터링된 CUSTOM 채팅방
    // =======================================================

    const filteredCustomRooms =
      computed(() => {

        if (
          customFilter.value === 'all'
        ) {

          return customRooms.value
        }


        return customRooms.value.filter(
          room => room.isSecret
        )
      })


    // =======================================================
    // CUSTOM 채팅방 클릭
    // =======================================================

    const handleCustomRoomClick = (
      room: CustomRoom
    ) => {

      // 비밀방
      if (room.isSecret) {

        const password =
          window.prompt(
            `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 비밀번호를 입력하세요:`
          )


        if (!password) {
          return
        }


        // TODO
        // 추후 비밀번호 검증 API 연결

        console.log(
          'CUSTOM 비밀방 입장:',
          room.id,
          password
        )

        return
      }


      // 공개방
      console.log(
        'CUSTOM 채팅방 입장:',
        room.id
      )
    }


    // =======================================================
    // Return
    // =======================================================

    return {

      customFilter,

      customRooms,

      filteredCustomRooms,

      setCustomRooms,

      addCustomRooms,

      changeCustomFilter,

      handleCustomRoomClick,
    }
  }
)