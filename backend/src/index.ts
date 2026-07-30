import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { initializeSocket } from "./socket/socket";
import { setSocketIO } from "./socket/socket";
import { startPresenceExpiredListener } from "./friends/services/friends.expired.redis.service";


const PORT =
  Number(process.env.PORT) || 3000;


const server =
  http.createServer(app);


const io =
  new Server(server, {
    cors: {
      origin: "*",
    },
  });


// socket io 전역 등록
setSocketIO(io);


// socket 인증 및 이벤트 등록
initializeSocket(io);


// redis expired listener 시작
startPresenceExpiredListener()
  .catch((error) => {
    console.error(
      "Failed to start presence listener",
      error
    );
  });



server.listen(
  PORT,
  () => {
    console.log(
      `server running on ${PORT}`
    );
  }
);