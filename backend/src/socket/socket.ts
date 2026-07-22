import { Server } from "socket.io";
import { registerOnlineEvents } from "./online.handler";

export const initializeSocket = (io: Server) => {

  io.on("connection", (socket) => {
    registerOnlineEvents(socket);
  });

};