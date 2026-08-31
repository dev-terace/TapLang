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
// Conversation
// =========================================================

interface Conversation {
  conversationId: string
  name?: string | null
  description?: string | null
  isSecret?: boolean
  lastMessageAt?: string | null
  createdAt?: string
  members?: {
    userId: number
    name?: string
    role: 'OWNER' | 'MEMBER'
  }[]
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
      ref<'my' | 'all' | 'secret'>('my')


    // =======================================================
    // 전체 CUSTOM 채팅방
    // =======================================================

    const customRooms =
      ref<CustomRoom[]>([])


    // =======================================================
    // 내가 참여한 CUSTOM 채팅방
    // =======================================================

    const joinedCustomRooms =
      ref<CustomRoom[]>([])


    // =======================================================
    // 현재 열려있는 CUSTOM 채팅방
    // =======================================================

    const currentRoom =
      ref<CustomRoom | null>(null)


    const password =
      ref<string | undefined>(undefined)


    // =======================================================
    // 현재 방 설정
    // =======================================================

    const setCurrentRoom = (
      room: CustomRoom | null
    ) => {

      currentRoom.value = room
    }


    const setPassword = (
      passwordValue: string | null
    ) => {

      password.value =
        passwordValue ?? undefined
    }


    // =======================================================
    // Conversation -> CustomRoom
    // =======================================================

    const setCurrentConversation = (
      conversation: Conversation
    ) => {

      const ownerMember =
        conversation.members?.find(
          member => member.role === 'OWNER'
        )

      currentRoom.value = {

        id:
          conversation.conversationId,

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

        type:
          'CUSTOM',

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
    // 전체 방
    // =======================================================

    const setCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      customRooms.value =
        rooms
    }


    const addCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      customRooms.value.push(
        ...rooms
      )
    }


    // =======================================================
    // 내가 참여한 방
    // =======================================================

    const setJoinedCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      joinedCustomRooms.value =
        rooms
    }


    const addJoinedCustomRooms = (
      rooms: CustomRoom[]
    ) => {

      joinedCustomRooms.value.push(
        ...rooms
      )
    }


    // =======================================================
    // 필터 변경
    // =======================================================

    const changeCustomFilter = (
      filter: 'my' | 'all' | 'secret'
    ) => {

      customFilter.value =
        filter
    }


    // =======================================================
    // 현재 화면에 표시할 방
    // =======================================================

    const filteredCustomRooms =
      computed(() => {

        // 내가 참여한 방
        if (
          customFilter.value === 'my'
        ) {

          return joinedCustomRooms.value
        }


        // 전체 방
        if (
          customFilter.value === 'all'
        ) {

          return customRooms.value
        }


        // 비밀방
        return customRooms.value.filter(
          room => room.isSecret
        )
      })


    // =======================================================
    // 방 클릭
    // =======================================================


    // =======================================================
    // 멤버 수 변경
    // =======================================================

    const updateRoomMemberCount = (
      conversationId: string,
      memberCount: number
    ) => {

      const room =
        customRooms.value.find(
          room =>
            room.id === conversationId
        )

      if (room) {
        room.members =
          memberCount
      }


      const joinedRoom =
        joinedCustomRooms.value.find(
          room =>
            room.id === conversationId
        )

      if (joinedRoom) {
        joinedRoom.members =
          memberCount
      }


      if (
        currentRoom.value?.id ===
        conversationId
      ) {

        currentRoom.value.members =
          memberCount
      }
    }


    // =======================================================
    // 방장 변경
    // =======================================================

    const updateRoomOwner = (
      conversationId: string,
      ownerId: number,
      ownerName: string
    ) => {

      const room =
        customRooms.value.find(
          room =>
            room.id === conversationId
        )

      if (room) {

        room.ownerId =
          ownerId

        room.owner =
          ownerName
      }


      const joinedRoom =
        joinedCustomRooms.value.find(
          room =>
            room.id === conversationId
        )

      if (joinedRoom) {

        joinedRoom.ownerId =
          ownerId

        joinedRoom.owner =
          ownerName
      }


      if (
        currentRoom.value?.id ===
        conversationId
      ) {

        currentRoom.value.ownerId =
          ownerId

        currentRoom.value.owner =
          ownerName
      }
    }


    // =======================================================
    // 방 조회
    // =======================================================

    const getCustomRoom = (
      conversationId: string
    ): CustomRoom | undefined => {

      return customRooms.value.find(
        room =>
          room.id === conversationId
      )
    }


    // =======================================================
    // 반환
    // =======================================================

    return {

      customFilter,

      customRooms,

      joinedCustomRooms,

      currentRoom,

      password,

      filteredCustomRooms,

      setCustomRooms,
      addCustomRooms,

      setJoinedCustomRooms,
      addJoinedCustomRooms,

      changeCustomFilter,

      setCurrentRoom,
      clearCurrentRoom,

      setCurrentConversation,

      updateRoomMemberCount,
      updateRoomOwner,

      setPassword,

      getCustomRoom
    }
  }
)