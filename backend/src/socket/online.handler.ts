import { Socket } from "socket.io";
import { onlineUsersService } from "../services/onlineUsers.redis.service";

export const registerOnlineEvents = (socket: Socket) => {

  const userId = Number(socket.handshake.auth.userId);

  onlineUsersService.addOnlineUser(userId, socket.id);

  socket.on("heartbeat", async () => {
    console.log("하트비트 실행: " + userId + ", id: "+socket.id)
    await onlineUsersService.heartbeat(userId, socket.id);

    socket.broadcast.emit("userOnline", userId);

  });

  socket.on("disconnect", async () => {
    await onlineUsersService.removeOnlineUser(userId);
  });

};