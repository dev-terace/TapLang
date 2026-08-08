import express, { Application, Request, Response,  NextFunction } from "express";
import cors from "cors";
import userRouter from "./users/routes/user.route";
import friendsRouter from "./friends/routes/friends.route";
import chatRoomRouter from "./chat/routes/chatRoom.route"
import chatRouter from "./chat/routes/chat.route"
import profileRouter from "./profile/routes/profile.route"
import { clerkMiddleware, requireAuth } from "@clerk/express";

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


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

export default app;