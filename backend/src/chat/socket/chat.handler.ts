import { Socket } from "socket.io";
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


const leaveConversationMember = (
  conversationId: string,
  userId: number
) => {
  const io = getSocketIO();

  const socketId = userSockets.get(userId);

  if (!socketId) {
    console.log(
      `[chatHandler] socket not found. userId=${userId}`
    );
    return;
  }

  const socket = io.sockets.sockets.get(socketId);

  if (!socket) {
    console.log(
      `[chatHandler] socket instance not found. userId=${userId}`
    );
    return;
  }

  const room = `conversation:${conversationId}`;

  socket.leave(room);

  console.log(
    `[chatHandler] user ${userId} left ${room}`
  );
};

export const registerLeaveConversationMember = (socket: Socket) => {
  socket.on(
    "conversation:leave",
    async (conversationId: string) => {
      try {
        const ownId = socket.data.userId;

        if (!ownId) {
          console.error(
            "[conversation:leave] userId가 없습니다."
          );
          return;
        }

        if (!conversationId) {
          console.error(
            "[conversation:leave] conversationId가 없습니다."
          );
          return;
        }

        leaveConversationMember(
          conversationId,
          ownId
        );

      } catch (error) {
        console.error(
          "[conversation:leave] error:",
          error
        );
      }
    }
  );
};