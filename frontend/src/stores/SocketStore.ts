import { defineStore } from "pinia";
import { ref } from "vue";
import type { Socket } from "socket.io-client";
import { useFriendStore } from "./FriendStore";
import {registerFriendSocket} from "@/socket/friend.socket"


import {
  connectSocket,
  disconnectSocket
} from "../services/socket.service";




export const useSocketStore = defineStore("socket", () => {

  const socket = ref<Socket | null>(null);
  const isOnlineUsersLoaded = ref(false)
  
  


  const connect =  async ()  => {

  if(socket.value) {
    return;
  }


 const socketInstance =
    await connectSocket();


  socket.value =
    socketInstance;


  registerFriendSocket(
    socketInstance
  );

    




  };


  const disconnect = () => {
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