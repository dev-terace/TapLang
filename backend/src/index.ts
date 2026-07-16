import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('유저가 연결되었습니다: ', socket.id);
  
  socket.on('disconnect', () => {
    console.log('유저가 연결을 끊었습니다: ', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`백엔드 서버가 포트 ${PORT}에서 작동 중입니다!`);
});