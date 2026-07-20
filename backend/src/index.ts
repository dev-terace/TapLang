import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/user.route';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 1. 필수 미들웨어 설정
app.use(cors());
// ⚠️ 중요: req.body로 들어오는 JSON 데이터를 파싱하기 위해 반드시 필요합니다!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. 라우터 연결
// 클라이언트가 /api/users 경로로 접근하면 userRouter로 요청을 전달합니다.
app.use('/api/users', userRouter);

// 3. 서버 상태 확인용 헬스체크 API
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 4. 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 정상 실행 중입니다.`);
  console.log(`👉 로그인/가입 엔드포인트: POST http://localhost:${PORT}/api/users`);
});