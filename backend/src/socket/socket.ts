import { Server, Socket } from "socket.io";
import { registerFriendEvents, registerHeartBeatEvents } from "../friends/socket/friends.handler";
import { verifyToken } from "@clerk/backend";
import { userService } from "../users/services/user.service";

let io: Server;

export const userSockets = new Map<number, string>();

export const setSocketIO = (
  socketIO: Server
) => {
  io = socketIO;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }
  return io;
};

const authenticateSocket = async (
  socket: Socket
) => {

  const token = socket.handshake.auth.token;

  if (!token) { throw new Error("Unauthorized");}

  const payload = await verifyToken(
    token,
    {secretKey: process.env.CLERK_SECRET_KEY!,}
  );

  
  const ownId = await userService.findUserIdByProviderId(payload.sub)
  socket.data.userId = ownId;

};



export const initializeSocket = (
  io: Server
) => {

  io.use(async (socket, next) => {

    try {
      await authenticateSocket(socket);
      next();

    } catch(error) {

      next(new Error("Unauthorized"));

    }

  });



  io.on(
    "connection",
    (socket) => {

      const userId = socket.data.userId;

      userSockets.set(userId, socket.id);

      socket.join(
        `user:${userId}`
      );

      socket.on("disconnect", () => {
        for (const [id, socketId] of userSockets) {
          if (socketId === socket.id) {
            userSockets.delete(id);
            break;
          }
        }

        console.log("disconnect user:", userId);
      });
      
      console.log("socket.join user:",  userId)
      

      registerFriendEvents(
        io,
        socket
      );

      registerHeartBeatEvents(socket)

    }
  );


};