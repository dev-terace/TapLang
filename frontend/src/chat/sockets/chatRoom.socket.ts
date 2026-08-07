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

      console.log("incoming", message);
      console.log("current room", chatRoomStore.conversationId);

    chatRoomStore.addMessage({
      id: message.message.id,
      conversationId: message.message.conversationId,
      senderId: message.message.senderId,
      senderName: message.message.senderName,
      content: message.message.content,
      attachments: message.message.attachments,
      createdAt: message.message.createdAt,
      flag: message.message.flag,
    });
    chatStore.getMyConversations()
  }
  );
}
