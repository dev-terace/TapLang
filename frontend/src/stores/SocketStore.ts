import { defineStore } from "pinia";
import { ref } from "vue";
import type { Socket } from "socket.io-client";
import { useFriendStore } from "./FriendStore";

import {
  connectSocket,
  disconnectSocket
} from "../services/socket.service";




export const useSocketStore = defineStore("socket", () => {

  const socket = ref<Socket | null>(null);
  const isOnlineUsersLoaded = ref(false)
  

  let heartbeatTimer: number | null = null;
  const friendStore = useFriendStore()
  

  const findOnlineUsers = () => {
      const friendIds = friendStore.friends.map(friend => friend.id);
      console.log("보내는 친구 ID", friendIds);
      socket.value?.emit("findOnlineUsers", friendIds)
  }


const startHeartbeat = () => {
  if (!socket.value) return;

  // 즉시 한 번 실행
  socket.value.emit("heartbeat");
  findOnlineUsers();

  // 이후 30초마다 반복
  heartbeatTimer = window.setInterval(() => {
    socket.value?.emit("heartbeat");
    findOnlineUsers();
  }, 20000);
};



  const stopHeartbeat = () => {

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

  };


  const connect = (userId: number) => {

    if (socket.value) return;


    socket.value = connectSocket(userId);


    startHeartbeat();
    

    socket.value.on(
      "getOnlineUsers",
      (onlineUserIds: number[]) => {
        friendStore.friends.forEach(friend => {
          friend.online = onlineUserIds.includes(friend.id);
        });

        isOnlineUsersLoaded.value = true
      }
    );



  };


  const disconnect = () => {

    stopHeartbeat();
    disconnectSocket();
    socket.value = null;
    isOnlineUsersLoaded.value = false


  };




  return {
    socket,
    connect,
    disconnect,
    isOnlineUsersLoaded
  };

});