import { defineStore } from "pinia";
import { ref } from "vue";
import type { Socket } from "socket.io-client";
import {
  connectSocket,
  disconnectSocket
} from "../services/socket.service";


export const useSocketStore = defineStore("socket", () => {

  const socket = ref<Socket | null>(null);

  const onlineUsers = ref<number[]>([]);

  let heartbeatTimer: number | null = null;


  const startHeartbeat = () => {

    if (!socket.value) return;

    heartbeatTimer = window.setInterval(() => {
      socket.value?.emit("heartbeat");
    }, 30000);

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
      "userOnline",
      (onlineUserId: number) => {

        if (!onlineUsers.value.includes(onlineUserId)) {
          onlineUsers.value.push(onlineUserId);
        }

      }
    );


    socket.value.on(
      "userOffline",
      (offlineUserId: number) => {

        onlineUsers.value =
          onlineUsers.value.filter(
            id => id !== offlineUserId
          );

      }
    );

  };


  const disconnect = () => {

    stopHeartbeat();

    disconnectSocket();

    socket.value = null;
    onlineUsers.value = [];

  };


  const isOnline = (userId: number) => {
    return onlineUsers.value.includes(userId);
  };


  return {
    socket,
    onlineUsers,
    connect,
    disconnect,
    isOnline
  };

});