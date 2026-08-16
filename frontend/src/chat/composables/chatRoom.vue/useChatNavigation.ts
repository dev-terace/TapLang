import { useUIStore } from '@/shared/ui/UiStore'
import { useChatStore, type Conversation } from '@/chat/store/Chat'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { storeToRefs } from 'pinia'

export function useChatNavigation() {
  const uiStore = useUIStore()
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const { userInfo } = storeToRefs(authStore)

  /**
   * 1. 기존 대화방 객체(Conversation)로 채팅방 이동 (ChatList.vue용)
   */
  const openConversation = (conversation: Conversation) => {
    const myId = String(userInfo.value?.id)
    const myName = userInfo.value?.name

    uiStore.conversationId = conversation.conversationId
    uiStore.isChatRoomCreate = false

    if (conversation.type === 'DIRECT') {
      const otherMember = conversation.members.find(
        member => String(member.userId) !== myId
      )
      const roomName = conversation?.name?.split('|').find(v => v !== myName) ?? '1:1 채팅'

      uiStore.changeChatRoomTab(
        true,
        otherMember ? [Number(otherMember.userId)] : [],
        roomName,
        'chatRoom'
      )
      return
    }

    // GROUP 로직
    uiStore.changeChatRoomTab(
      false,
      conversation.members
        .filter(member => String(member.userId) !== myId)
        .map(member => Number(member.userId)),
      conversation.name ?? '',
      'inviteChatRoom'
    )
  }

  /**
   * 2. 유저 ID/이름으로 1:1 채팅방 이동 또는 신규 생성 (FriendSidebar.vue용)
   */
  const openDirectChatWithUser = async (targetUserId: number | string, targetUserName: string) => {
    await chatStore.getMyConversations()

    // 내 목록 중 해당 유저와의 DIRECT 방 검색
    const existingRoom = chatStore.conversations?.data?.find((c: Conversation) =>
      c.type === 'DIRECT' &&
      c.members.some(m => String(m.userId) === String(targetUserId))
    )

    if (existingRoom) {
      // 기존 방이 있으면 openConversation 함수 재활용
      openConversation(existingRoom)
    } else {
      // 기존 방이 없는 경우 신규 세팅
      uiStore.conversationId = null
      uiStore.isChatRoomCreate = true
      uiStore.changeChatRoomTab(true, [Number(targetUserId)], targetUserName, 'chatRoom')
    }
  }

  return {
    openConversation,
    openDirectChatWithUser
  }
}