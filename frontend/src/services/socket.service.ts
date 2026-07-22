import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: number): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      userId,
    },
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};