import express, { Application, Request, Response } from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
import friendsRouter from "./routes/friends.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/friends", friendsRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

export default app;