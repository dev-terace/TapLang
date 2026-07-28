import { Server, Socket } from "socket.io";
import { registerFriendEvents, registerHeartBeatEvents } from "./friends.handler";
import { verifyToken } from "@clerk/backend";
import { userService } from "../services/user.service"

let io: Server;


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


      socket.join(
        `user:${userId}`
      );

      console.log("socket.join user:",  userId)
      

      registerFriendEvents(
        io,
        socket
      );

      registerHeartBeatEvents(socket)

    }
  );


};