import type { Socket } from "socket.io-client";


 
export function registerChatSocket(
  socket: Socket,
) {
    socket.off("message:new");
    
    socket.on("message:new", (message) => {
    console.log("메시지 받기", message);
  });
}
