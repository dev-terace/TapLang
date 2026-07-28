import { io, Socket } from "socket.io-client";
import { getToken } from "./auth.service";

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> =>  {
  
  if (socket) {
    return socket;
  }

  const token = await getToken();

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token,
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