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
    // 현재 열려있는 CUSTOM 채팅방
    // =======================================================

    const currentRoom =
      ref<CustomRoom | null>(null)


    // =======================================================
    // 현재 방 설정
    // =======================================================

    const setCurrentRoom = (
      room: CustomRoom | null
    ) => {

      currentRoom.value = room
    }



    const setCurrentConversation = (
      conversation: Conversation
    ) => {

      const ownerMember =
        conversation.members?.find(
          member => member.role === 'OWNER'
        )

      currentRoom.value = {

        id: conversation.conversationId,

        title:
          conversation.name ??
          'CUSTOM 채팅방',

        desc:
          conversation.description ??
          '',

        ownerId:
          ownerMember?.userId ??
          0,

        owner:
          ownerMember?.name ??
          '알 수 없음',

        members:
          conversation.members?.length ??
          0,

        isSecret:
          conversation.isSecret ??
          false,

        type: 'CUSTOM',

        lastMessageAt:
          conversation.lastMessageAt ??
          null,

        createdAt:
          conversation.createdAt ??
          new Date().toISOString()
      }
    }

    // =======================================================
    // 현재 방 초기화
    // =======================================================

    const clearCurrentRoom = () => {

      currentRoom.value = null
    }


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

      if (room.isSecret) {

        const password =
          window.prompt(
            `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 비밀번호를 입력하세요:`
          )

        if (!password) {
          return
        }

        console.log(
          'CUSTOM 비밀방 입장:',
          room.id,
          password
        )

        return
      }

      console.log(
        'CUSTOM 채팅방 입장:',
        room.id
      )
    }


    const updateRoomMemberCount = (
      conversationId: string,
      memberCount: number
    ) => {
      const room = customRooms.value.find(
        room => room.id === conversationId
      )

      if (!room) {
        return
      }

      room.members = memberCount

      // 현재 열려있는 방이라면 같이 변경
      if (currentRoom.value?.id === conversationId) {
        currentRoom.value.members = memberCount
      }
    }


    const updateRoomOwner = (
      conversationId: string,
      ownerId: number,
      ownerName: string
    ) => {
      const room = customRooms.value.find(
        room => room.id === conversationId
      )

      if (!room) {
        return
      }

      room.ownerId = ownerId
      room.owner = ownerName

      // 현재 열려있는 방이라면 같이 변경
      if (currentRoom.value?.id === conversationId) {
        currentRoom.value.ownerId = ownerId
        currentRoom.value.owner = ownerName
      }
    }


    return {

      customFilter,

      customRooms,

      currentRoom,

      filteredCustomRooms,

      setCustomRooms,

      addCustomRooms,

      changeCustomFilter,

      setCurrentRoom,

      clearCurrentRoom,

      handleCustomRoomClick,
      setCurrentConversation,
      updateRoomMemberCount,
      updateRoomOwner
    }
  }
)