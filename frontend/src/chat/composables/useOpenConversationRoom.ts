import { useUIStore } from '@/shared/ui/UiStore'
import { useAuthStore } from '@/shared/auth/AuthStore'

import type { Conversation } from '@/chat/store/Chat'

import { useChatRoomStore } from '../store/ChatRoom'
import { useCustomChatStore } from '@/custom_chat/stores/CustomChatStore'


export function useOpenConversation() {

  const uiStore = useUIStore()
  const authStore = useAuthStore()
  const chatRoomStore = useChatRoomStore()
  const customChatStore = useCustomChatStore()


  const openConversation = (
    conversation: Conversation
  ) => {


    console.log("openConversation", conversation)
    const userId =
      authStore.userInfo?.id

    const userName =
      authStore.userInfo?.name


    // ==================================================
    // 사용자 확인
    // ==================================================

    if (!userId) {

      console.warn(
        '현재 사용자 정보가 없습니다.'
      )

      return
    }


    console.log(
      '🔥 openConversation 받은 conversation:',
      JSON.stringify(
        conversation,
        null,
        2
      )
    )


    // ==================================================
    // 실제 Conversation ID 추출
    // ==================================================

    const conversationId =
      conversation.conversationId ??
      (conversation as any).id


    if (!conversationId) {

      console.error(
        '❌ conversationId를 찾을 수 없습니다:',
        conversation
      )

      return
    }


    // ==================================================
    // DIRECT
    // ==================================================

    if (
      conversation.type === 'DIRECT'
    ) {

      const otherMember =
        conversation.members.find(
          member =>
            String(member.userId) !==
            String(userId)
        )


      const roomName =
        conversation.name
          ?.split('|')
          .find(
            value =>
              value !== userName
          )
        ??
        '1:1 채팅'


      uiStore.conversationId =
        conversationId


      uiStore.changeChatRoomTab(
        true,

        otherMember
          ? [Number(otherMember.userId)]
          : [],

        roomName,

        'chatRoom'
      )


      return
    }


    // ==================================================
    // GROUP
    // ==================================================

    if (
      conversation.type === 'GROUP'
    ) {

      const memberIds =
        conversation.members
          .filter(
            member =>
              String(member.userId) !==
              String(userId)
          )
          .map(
            member =>
              Number(member.userId)
          )


      console.log(
        '🔥 그룹방 ID:',
        conversationId
      )

      console.log(
        '🔥 그룹방 멤버:',
        memberIds
      )


      uiStore.conversationId =
        conversationId


      uiStore.changeChatRoomTab(
        false,

        memberIds,

        conversation.name ??
        '그룹 채팅방',

        'inviteChatRoom'
      )


      console.log(
        '🔥 UIStore 최종 ID:',
        uiStore.conversationId
      )


      return
    }


    // ==================================================
    // CUSTOM
    // ==================================================

    if (conversation.type === 'CUSTOM') {

      customChatStore.setCurrentConversation(
        conversation
      )

      chatRoomStore.setConversationId(
        conversationId
      )

      uiStore.conversationId =
        conversationId

      uiStore.currentTab =
        'customChatRoom'

      return
    }


    // ==================================================
    // 알 수 없는 타입
    // ==================================================

    console.warn(
      '⚠️ 지원하지 않는 Conversation type:',
      conversation.type
    )
  }


  return {
    openConversation
  }
}