import { Socket } from "socket.io";
import { onlineUsersService } from "../services/onlineUsers.redis.service";

export const registerOnlineEvents = (socket: Socket) => {

  const userId = Number(socket.handshake.auth.userId);

  onlineUsersService.addOnlineUser(userId, socket.id);

  socket.on("heartbeat", async () => {
    console.log("하트비트 실행: " + userId + ", id: "+socket.id)
    await onlineUsersService.heartbeat(userId, socket.id);


  });

  socket.on("findOnlineUsers", async (data) => {
     const onlineUsers = await onlineUsersService.getOnlineUsers(data);
    
     console.log("onlineUsers : "+onlineUsers)
      socket.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("disconnect", async () => {
    await onlineUsersService.removeOnlineUser(userId);
  });

};