import express, { Application, Request, Response } from "express";
import cors from "cors";
import userRouter from "./users/routes/user.route";
import friendsRouter from "./friends/routes/friends.route";
import chatRoomRouter from "./chat/routes/chatRoom.route"
import chatRouter from "./chat/routes/chat.route"
import profileRouter from "./profile/routes/profile.route"
import countryRouter from "./profile/routes/country.route"
import blockRouter from "./block/routes/block.route"
import translateRouter from "./ai_translator/router/translator.router"
import chatSettingsRouter from "./chat_settings/router/chatSettings.router"
import { clerkMiddleware, requireAuth } from "@clerk/express"
import chatNotificationRouter from "./chat/routes/chatRoomNotification.router"
import imageRouter from "./image/router/image.router"
import customChatRouter from "./custom_chat/router/customChat_router"
import customChatRoomRouter from "./custom_chat/router/customChatRoom.router"
import quizRouter from "./quiz/router/quiz.router"
import findPeopleRouter from "./find_people/router/findPeople.router"
import noticeRouter from "./notice/router/notice.router"

import './image/service/uploadCleanUp.service'
import './chat/services/cleanupScheduler.service'

const app: Application = express();

const clientUrlRaw = process.env.CLIENT_URL;

if (!clientUrlRaw) {
  throw new Error("CLIENT_URL이 설정되지 않았습니다.");
}

const allowedOrigins = clientUrlRaw.split(",").map((url) => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없거나(Postman, 동일 출처 등) 허용 목록에 있으면 해당 origin 단 하나만 반환
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS 정책에 의해 차단되었습니다."));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));




app.use(clerkMiddleware());

const requireApiAuth = requireAuth();


app.use("/api/users", requireApiAuth, userRouter);
app.use("/api/friends", requireApiAuth, friendsRouter);
app.use("/api/chat-room", requireApiAuth, chatRoomRouter)
app.use("/api/chat", requireApiAuth, chatRouter)
app.use("/api/profile", requireApiAuth, profileRouter)
app.use("/api/profile/country", requireApiAuth, countryRouter)
app.use("/api/block", requireApiAuth, blockRouter)
app.use("/api/translate", requireApiAuth, translateRouter)
app.use("/api/chat-settings", requireApiAuth, chatSettingsRouter)
app.use("/api/chat-room-notification", requireApiAuth, chatNotificationRouter)
app.use("/api/image", requireApiAuth, imageRouter)
app.use("/api/custom-chat", requireApiAuth, customChatRouter)
app.use("/api/custom-chat-room", requireApiAuth, customChatRoomRouter)
app.use("/api/quiz", requireApiAuth, quizRouter)
app.use("/api/find-people", requireApiAuth, findPeopleRouter);
app.use("/api/notices", requireApiAuth, noticeRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

export default app;