import express, { Application, Request, Response } from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
import friendsRouter from "./routes/friends.route";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import session from "express-session";

const app: Application = express();

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(clerkMiddleware());

const requireApiAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};


app.use("/api/users", requireApiAuth, userRouter);
app.use("/api/friends", requireApiAuth, friendsRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

export default app;