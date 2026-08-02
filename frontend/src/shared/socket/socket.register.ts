import { defineStore } from "pinia";
import { ref } from "vue";
import type { Socket } from "socket.io-client";
import { useFriendStore } from "../../friends/stores/FriendStore";
import {registerFriendSocket} from "@/friends/sockets/friend.socket"
import { startHeartbeat } from "@/friends/sockets/friend.heartbeat.socket";
import { registerChatSocket } from "@/chat/sockets/chat.socket";
import {
  connectSocket,
  disconnectSocket
} from "./socket.config";




export const useSocketRegister = defineStore("socket", () => {

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
  startHeartbeat(socketInstance);
  registerChatSocket(socketInstance);
    


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