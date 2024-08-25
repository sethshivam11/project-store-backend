import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./src/middlewares/error.middleware";
import { UserInterface } from "./src/models/user.model";
import { createServer } from "http";
import cors from "cors";

declare module "express" {
  interface Request {
    user?: UserInterface;
  }
}

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route imports
import userRouter from "./src/routes/user.route";
import taskRouter from "./src/routes/task.route";
import projectRouter from "./src/routes/project.route";

// Routes declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/projects", projectRouter);
app.get("/", (_: Request, res: Response) => {
  return res.json({
    success: true,
    status: 200,
    data: {},
    message: "App is running",
  });
});

app.use(errorHandler);

export default httpServer;
