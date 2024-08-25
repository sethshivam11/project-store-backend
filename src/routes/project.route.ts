import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
  createProject,
  deleteProject,
  getUserProjects,
  markAsActive,
  markAsInactive,
  removeImage,
  updateProject,
} from "../controllers/project.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(upload.single("image"), createProject);

router.route("/get").get(getUserProjects);

router.route("/markActive/:projectId").patch(markAsActive);

router.route("/markInactive/:projectId").patch(markAsInactive);

router.route("/delete/:projectId").delete(deleteProject);

router.route("/update/:projectId").put(upload.single("image"), updateProject);

router.route("/removeImage/:projectId").patch(removeImage);

export default router;
