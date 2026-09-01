import type { Socket } from "socket.io-client";

import { useCustomChatStore } from "../stores/CustomChatStore";
import { useUIStore } from "@/shared/ui/UiStore";
import i18n from "@/i18n";


export const registerTransferredOwnerProc = (socket: Socket) => {
  const customChatStore = useCustomChatStore()

  socket.off("custom-chat-room:owner:rendering")
  socket.on("custom-chat-room:owner:rendering", async (data) => {
    const {
      conversationId,
      ownerId,
      ownerName
    } = data



    customChatStore.updateRoomOwner(
      conversationId,
      ownerId,
      ownerName
    )
  })
}


export const registerKickedMemberProc = (socket: Socket) => {

  const customChatStore = useCustomChatStore()
  const uiStore = useUIStore()
  socket.off("custom-chat-room:members:rendering")

  socket.on("custom-chat-room:members:rendering", async (data) => {
    const {
      conversationId,
      memberCount
    } = data



    customChatStore.updateRoomMemberCount(
      conversationId,
      memberCount
    )
  })

  socket.on("custom-chat-room:kicked", async (data) => {
    const { kicked } = data

    if (kicked) {
      uiStore.changeTab('customChat')
      window.alert(i18n.global.t('custom-chat-room-socket.kickedAlert'));
      uiStore.conversationId = null
    }
  })
}