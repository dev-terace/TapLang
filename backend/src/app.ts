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

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




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
app.use("/api/notices", noticeRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

export default app;