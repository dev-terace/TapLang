import type { Socket } from "socket.io-client";
import { useChatRoomStore } from "../store/ChatRoom";
import { useChatStore } from "../store/Chat";
import { useUIStore } from "@/shared/ui/UiStore";

export function registerChatRoomSocket(socket: Socket) {
  const chatRoomStore = useChatRoomStore();
  const chatStore = useChatStore();
  const uiStore = useUIStore();

  socket.off("message:new");

  socket.on("message:new", async (data) => {
    const msg = data.message;
    console.log("새 메시지 수신:", msg);

    // 1. 현재 열려있는 채팅방과 메시지가 온 채팅방이 일치하는지 확인
    const isMatchingRoom = chatRoomStore.conversationId === msg.conversationId;
    
    // 2. 현재 화면이 채팅방 화면인지 확인 (1:1 채팅 & 그룹 채팅 모두 포함)
    const isViewingChatTab = uiStore.currentTab === "chatRoom" || uiStore.currentTab === "inviteChatRoom";

    // 3. 현재 이 방을 보고 있다면 메시지를 목록에 즉시 추가
    if (isMatchingRoom) {
      chatRoomStore.addMessage({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        flag: msg.flag,
      });
    }

    // 4. 읽음 처리 및 목록 갱신 로직
    if (isViewingChatTab && isMatchingRoom) {
      // 유저가 해당 채팅방을 보고 있는 상태이므로 '읽음' 처리
      await chatStore.readConversation(msg.conversationId);
      await chatStore.getMyConversations();
    } else {
      // 유저가 다른 탭이나 다른 채팅방에 있다면 안 읽음 카운트만 올라가도록 목록 갱신
      await chatStore.getMyConversations();
    }
  });
}