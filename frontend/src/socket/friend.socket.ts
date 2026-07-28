import type { Socket } from "socket.io-client";
import { useFriendStore } from "@/stores/FriendStore";

 
export function registerFriendSocket(
  socket: Socket
) {

  const friendStore = useFriendStore();


socket.emit("friend:own:init");
  

const heartbeat = () => {
  if (!socket.connected) {
    return;
  }

  socket.timeout(5000).emit(
    "friend:heartbeat",
    (err: Error | null) => {

      if (!err) {
        setTimeout(heartbeat, 30000);
      } else {
        setTimeout(heartbeat, 5000);
      }

    }
  );
};
heartbeat();


socket.on(
  "friend:online",
  (onlineUserId: number) => {


    const friend = friendStore.friends.find(
      friend => friend.id === onlineUserId
    );

   

    if (friend) {
      friend.online = true;
    }

  }
);


  // 다른 사용자가 오프라인 됨
socket.on(
  "friend:offline",
  (offlineUserId: number) => {

    const friend = friendStore.friends.find(
      friend => friend.id === offlineUserId
    );

    console.log("friend:offline : ", friend)

    if (friend) {
      friend.online = false;
    }

  }
);

  socket.on(
    "disconnect",
    () => {
      clearInterval(
        heartbeatInterval
      );
    }
  );

}