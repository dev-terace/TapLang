import { ref, watch } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useCustomChatStore } from '@/custom_chat/stores/CustomChatStore'
import { customChatApi } from '@/custom_chat/api/customChat.api'

export type RoomListMode = 'all' | 'secret' | 'my'

export function useCustomChatList() {
  const uiStore = useUIStore()
  const customChatStore = useCustomChatStore()

  const isLoading = ref(false)

  // 다음 페이지 cursor
  const nextCursor = ref<customChatApi.CustomChatCursor | null>(null)
  const myNextCursor = ref<customChatApi.MyCustomChatCursor | null>(null)

  const roomListMode = ref<RoomListMode>('all')

  // =========================================================
  // CUSTOM 채팅방 목록 조회
  // =========================================================
  const loadCustomChats = async (loadMore = false) => {
    if (isLoading.value) return
    if (loadMore && !nextCursor.value) return

    isLoading.value = true

    try {
      const response = await customChatApi.getCustomChats(
        loadMore ? nextCursor.value ?? undefined : undefined
      )

      if (loadMore) {
        customChatStore.addCustomRooms(response.items)
      } else {
        customChatStore.setCustomRooms(response.items)
      }

      nextCursor.value = response.nextCursor
    } catch (error) {
      console.error('CUSTOM 채팅방 목록 조회 실패:', error)
      window.alert(
        error instanceof Error ? error.message : '사설 대화방 목록을 불러오지 못했습니다.'
      )
    } finally {
      isLoading.value = false
    }
  }

  const loadMyCustomChats = async (loadMore = false) => {
    if (loadMore && !myNextCursor.value) return

    try {
      isLoading.value = true
      const response = await customChatApi.getMyCustomChats(
        loadMore ? myNextCursor.value ?? undefined : undefined
      )

      console.log('내 CUSTOM 채팅방:', response)

      if (!loadMore) {
        customChatStore.setJoinedCustomRooms(response.items)
      } else {
        customChatStore.addJoinedCustomRooms(response.items)
      }

      myNextCursor.value = response.nextCursor
    } catch (error) {
      console.error('내 CUSTOM 채팅방 조회 실패:', error)
    } finally {
      isLoading.value = false
    }
  }

  const changeRoomListMode = async (mode: RoomListMode) => {
    if (isLoading.value) return

    roomListMode.value = mode
    customChatStore.changeCustomFilter(mode)

    if (mode === 'my') {
      myNextCursor.value = null
      customChatStore.setJoinedCustomRooms([])
      await loadMyCustomChats()
      return
    }

    nextCursor.value = null
    customChatStore.setCustomRooms([])
    await loadCustomChats()
  }

  // =========================================================
  // 다음 30개 불러오기
  // =========================================================
  const loadMoreCustomChats = () => {
    if (isLoading.value) return

    if (roomListMode.value === 'my') {
      if (!myNextCursor.value) return
      loadMyCustomChats(true)
      return
    }

    if (!nextCursor.value) return
    loadCustomChats(true)
  }

  // =========================================================
  // 채팅방 입장 로직
  // =========================================================
// =========================================================
// 채팅방 입장 로직
// =========================================================
const enterCustomRoom = async (
  room: ReturnType<typeof customChatStore.filteredCustomRooms>[0],
  password?: string
) => {
  if (isLoading.value) return false

  try {
    isLoading.value = true

    // 이미 가입되어 있는 방인지 확인
    const isAlreadyJoined = customChatStore.joinedCustomRooms.some(
      (joinedRoom) => joinedRoom.id === room.id
    )

    // 비밀방이고 비밀번호가 없는데, 내 가입 방도 아니고 'my' 탭도 아닌 경우 진입 막음
    if (room.isSecret && !password && roomListMode.value !== 'my' && !isAlreadyJoined) {
      return false
    }

    customChatStore.setCurrentRoom(room)

    if (password) {
      customChatStore.setPassword(password)
    }

    uiStore.conversationId = room.id
    uiStore.currentTab = 'customChatRoom'

    return true
  } catch (error) {
    console.error('[CUSTOM ROOM] 입장 실패:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

const handleCustomRoomClick = async (
  room: ReturnType<typeof customChatStore.filteredCustomRooms>[0]
) => {
  let password: string | undefined

  console.log("handleCustomRoomClick room id", room.id)

  // 이미 가입되어 있는 방인지 확인
  const isAlreadyJoined = customChatStore.joinedCustomRooms.some(
    (joinedRoom) => joinedRoom.id === room.id
  )

  // 비밀방이더라도 (내 참여 방 탭이거나 || 이미 가입된 방이면) prompt를 띄우지 않음
  if (room.isSecret && roomListMode.value !== 'my' && !isAlreadyJoined) {
    password = window.prompt(
      `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 비밀번호를 입력하세요:`
    ) ?? undefined

    if (!password) return
  }

  await enterCustomRoom(room, password)
}

  // =========================================================
  // groupChat 탭이 열릴 때 자동 조회
  // =========================================================
  watch(
    () => uiStore.currentTab,
    (tab) => {
      if (tab !== 'customChat') return

      roomListMode.value = 'all'
      customChatStore.changeCustomFilter('all')

      nextCursor.value = null
      myNextCursor.value = null

      customChatStore.setCustomRooms([])
      loadCustomChats()
    },
    { immediate: true }
  )

  return {
    isLoading,
    nextCursor,
    myNextCursor,
    roomListMode,
    changeRoomListMode,
    loadMoreCustomChats,
    enterCustomRoom,
    handleCustomRoomClick
  }
}