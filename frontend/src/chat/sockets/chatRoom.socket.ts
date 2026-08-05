import type { Socket } from "socket.io-client";
import { useChatRoomStore } from "../store/ChatRoom";
import { useChatStore } from "../store/Chat";


export function registerChatRoomSocket(
  socket: Socket,
) {
  const chatRoomStore = useChatRoomStore()
  const chatStore = useChatStore()

  socket.off("message:new");

  socket.on("message:new", (message) => {
    console.log("메시지 받기", message);
    chatRoomStore.addMessage({
      id: message.message.id,
      senderId: message.message.senderId,
      senderName: message.userInfo.name,
      content: message.message.content,
      createdAt: message.message.createdAt
    });
    chatStore.getMyConversations()
  }
);
}
