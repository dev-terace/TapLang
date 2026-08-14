import { Server } from "socket.io";
import { getSocketIO, userSockets } from "../../socket/socket";

export const joinConversationMembers = (
  conversationId: string,
  memberIds: number[],
  ownId: number
) => {
  const io = getSocketIO();


  console.log("chatHandler: memberIds", memberIds);

  const newMemberIds = [...memberIds];
  newMemberIds.push(ownId)
  newMemberIds.forEach((memberId) => {
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
    conversationId: string;
    senderId: number;
    senderName?: string;
    content: string;
    attachments?: unknown | null;
    createdAt: string;
    flag: string;
  },
  userInfo: {
    id: number,
    name: string,
    flag: string,
    statusMsg: string | null,

  },
  conversationName : string
) => {
  const io = getSocketIO();
  console.log("emitNewMEssage conv Id", conversationId);
  io.to(`conversation:${conversationId}`)
    .emit("message:new", {
      message: message,
      userInfo: userInfo,
      conversationName
    });
};