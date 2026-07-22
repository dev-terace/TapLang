import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { initializeSocket } from "./socket/socket";

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initializeSocket(io);


server.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});