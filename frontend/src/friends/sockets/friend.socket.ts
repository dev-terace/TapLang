import type { Socket } from "socket.io-client";
import { useFriendStore } from "@/friends/stores/FriendStore";
import { useChatStore } from "@/chat/store/Chat";
import { useBlockStore } from "@/block/store/BlockStore";

export function registerFriendSocket(
  socket: Socket
) {

  const friendStore = useFriendStore();
  const chatStore = useChatStore();
  const blockStore = useBlockStore();


  socket.on("disconnect", (reason) => {
    console.log("disconnect", reason);
  });

  socket.io.on("reconnect_attempt", () => {
    console.log("reconnect attempt");
  });

  socket.io.on("reconnect", (attempt) => {
    console.log("reconnected", attempt);
    window.location.reload();
  });


  socket.on("connect", () => {
    console.log("connected", socket.id);
    socket.emit("friend:own:init");
  });


  socket.on("friend:reload", async (data) => {
    console.log("friend reload", data);

    if (data.reload) {
      await Promise.all([
        friendStore.fetchFriends(),
        friendStore.findReqFriends(),
        chatStore.getMyConversations(),
        blockStore.getBlockedUsers(),
      ]);
      socket.emit("friend:own:init");
    }
  });


  socket.on(
    "friend:online",
    (onlineUserId: number) => {


      const friend = friendStore.friends.find(
        friend => friend.id === onlineUserId
      );


      console.log("friend:online : ", friend)
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



}