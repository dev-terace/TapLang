import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n' // i18n 추가
import { useUIStore } from '@/shared/ui/UiStore'
import { customChatApi } from '@/custom_chat/api/customChat.api'
import {
  useCustomChatStore,
  type CustomRoom
} from '@/custom_chat/stores/CustomChatStore'

export type RoomListMode = 'all' | 'secret' | 'my'

// t 함수를 두 번째 인자로 받도록 수정
const toCustomRoom = (
  item: customChatApi.CustomChatItem,
  t: (key: string) => string
): CustomRoom => ({
  id: item.id,
  title: item.title ?? t('use-custom-chat-list.unnamedRoom'),
  desc: item.desc ?? '',
  ownerId: item.ownerId ?? 0,
  owner: item.owner ?? '',
  members: item.members ?? 0,
  isSecret: item.isSecret ?? false,
  type: 'CUSTOM',
  lastMessageAt: item.lastMessageAt,
  createdAt: item.createdAt
})

export function useCustomChatList() {
  const { t } = useI18n() // t 함수 가져오기
  const uiStore = useUIStore()
  const customChatStore = useCustomChatStore()

  const isLoading = ref(false)

  // 다음 페이지 cursor
  const nextCursor = ref<customChatApi.CustomChatCursor | null>(null)
  const myNextCursor = ref<customChatApi.MyCustomChatCursor | null>(null)

  const roomListMode = ref<RoomListMode>('my')

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

      // t 함수 전달
      const rooms = response.items.map((item) => toCustomRoom(item, t))

      console.log("loadCustom chat response item", response.items)

      if (loadMore) {
        customChatStore.addCustomRooms(rooms)
      } else {
        customChatStore.setCustomRooms(rooms)
      }

      nextCursor.value = response.nextCursor
    } catch (error) {
      console.error(t('use-custom-chat-list.errorLogList'), error)
      window.alert(
        error instanceof Error ? error.message : t('use-custom-chat-list.errorAlertList')
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


      if (!loadMore) {
        customChatStore.setJoinedCustomRooms(response.items)
      } else {
        customChatStore.addJoinedCustomRooms(response.items)
      }

      myNextCursor.value = response.nextCursor
    } catch (error) {
      console.error(t('use-custom-chat-list.errorLogMyList'), error)
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
  const enterCustomRoom = async (
    room: CustomRoom,
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
      console.error(t('use-custom-chat-list.errorLogEnter'), error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const handleCustomRoomClick = async (
     room: (typeof customChatStore.filteredCustomRooms)[number]
  ) => {
    let password: string | undefined

    console.log("handleCustomRoomClick room id", room.id)

    // 이미 가입되어 있는 방인지 확인
    const isAlreadyJoined = customChatStore.joinedCustomRooms.some(
      (joinedRoom) => joinedRoom.id === room.id
    )

    // 비밀방이더라도 (내 참여 방 탭이거나 || 이미 가입된 방이면) prompt를 띄우지 않음
    if (room.isSecret && roomListMode.value !== 'my' && !isAlreadyJoined) {
      // 변수 보간 적용
      password = window.prompt(
        t('use-custom-chat-list.promptSecretPassword', { title: room.title })
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

      roomListMode.value = 'my'
      customChatStore.changeCustomFilter('my')

      nextCursor.value = null
      myNextCursor.value = null

      customChatStore.setCustomRooms([])
      loadMyCustomChats()
    },
    { immediate: true }
  )

  const refreshCustomChats = async () => {
    if (isLoading.value) return

    nextCursor.value = null
    myNextCursor.value = null

    if (roomListMode.value === 'my') {
      customChatStore.setJoinedCustomRooms([])
      await loadMyCustomChats()
      return
    }

    customChatStore.setCustomRooms([])
    await loadCustomChats()
  }

  return {
    isLoading,
    nextCursor,
    myNextCursor,
    roomListMode,
    changeRoomListMode,
    loadMoreCustomChats,
    enterCustomRoom,
    handleCustomRoomClick,
    refreshCustomChats
  }
}