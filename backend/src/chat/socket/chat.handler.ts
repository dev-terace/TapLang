import { Server } from "socket.io";
import { getSocketIO, userSockets } from "../../socket/socket";

export const joinConversationMembers = (
  conversationId: string,
  memberIds: number[],
  ownId: number
) => {
  const io = getSocketIO();


  console.log("chatHandler: memberIds", memberIds);
  memberIds.push(ownId)
  memberIds.forEach((memberId) => {
    const socketId = userSockets.get(memberId);

    if (!socketId) return;

    const socket = io.sockets.sockets.get(socketId);

    if (!socket) return;

    socket.join(`conversation:${conversationId}`);
  });
};


export const emitNewMessage = (
  conversationId: string,
  message: {
    id: string;
    senderId: number;
    content: string;
    attachments?: unknown | null;
    createdAt: Date;
  }
) => {
  const io = getSocketIO();

  io.to(`conversation:${conversationId}`)
    .emit("message:new", {
      messageId: message.id,
      conversationId,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachments,
      createdAt: message.createdAt,
    });
};