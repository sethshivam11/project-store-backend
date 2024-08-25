import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
  assignTask,
  createTask,
  deleteTask,
  getProjectTasks,
  getUserTasks,
  markAsComplete,
  markAsIncomplete,
  unassignTask,
  updateTask,
} from "../controllers/task.controller";

const router = Router();

router.use(verifyJWT);

router.route("/create/:projectId").post(createTask);

router.route("/user/:userId").get(getUserTasks);

router.route("/project/:projectId").get(getProjectTasks);

router.route("/assign").patch(assignTask);

router.route("/unassign").patch(unassignTask);

router.route("/markComplete/:taskId").patch(markAsComplete);

router.route("/markIncomplete/:taskId").patch(markAsIncomplete);

router.route("/update/:taskId").put(updateTask);

router.route("/delete/:taskId").delete(deleteTask);

export default router;
