import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import Project from "../models/project.model";
import { ApiResponse } from "../utils/ApiResponse";
import { File } from "./user.controller";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";

const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { title, description, startDate, endDate } = req.body;

  const imageFile = req.file as File;
  let image: string[] = [""];
  if (imageFile) {
    const upload = await uploadToCloudinary(imageFile.path);
    if (upload) image[0] = upload.url;
  }

  const project = await Project.create({
    title,
    description,
    startDate,
    endDate,
    image: image[0],
    admin: _id,
    active: true,
  });

  if (!project) {
    throw new ApiError(500, "Error creating project");
  }

  return res.json(
    new ApiResponse(201, project, "Project created successfully")
  );
});

const getUserProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;

  const projects = await Project.find({ admin: { $in: [_id] } }).populate({
    model: "user",
    path: "admin",
    select: "fullName username avatar",
    strictPopulate: false,
  });
  if (!projects || !projects.length) {
    throw new ApiError(404, "No projects found");
  }

  return res.json(
    new ApiResponse(200, projects, "Projects retrieved successfully")
  );
});

const markAsActive = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { projectId } = req.params;

  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  project.active = true;
  await project.save();

  return res.json(new ApiResponse(200, {}, "Project marked as active"));
});

const markAsInactive = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { projectId } = req.params;

  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  project.active = false;
  await project.save();

  return res.json(new ApiResponse(200, {}, "Project marked as inactive"));
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { projectId } = req.params;
  const { title, description, startDate, endDate, admin } = req.body;

  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  const image = [""];
  const imageFile = req.file as File;
  if (imageFile) {
    await deleteFromCloudinary(project.image);
    const upload = await uploadToCloudinary(imageFile.path);
    if (upload) image[0] = upload.url;
  }

  if (title) project.title = title;
  if (description) project.description = description;
  if (startDate) project.startDate = startDate;
  if (endDate) project.endDate = endDate;
  if (admin) project.admin = [...project.admin, ...admin];
  if (image[0]) project.image = image[0];

  await project.save();

  return res.json(
    new ApiResponse(200, project, "Project updated successfully")
  );
});

const removeImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { projectId } = req.params;

  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  project.image = "";
  await project.save();

  return res.json(new ApiResponse(200, {}, "Image removed"));
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { _id } = req.user;
  const { projectId } = req.params;

  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  await deleteFromCloudinary(project.image);
  await project.deleteOne();

  return res.json(new ApiResponse(200, {}, "Project deleted"));
});

export {
  getUserProjects,
  createProject,
  markAsActive,
  markAsInactive,
  updateProject,
  removeImage,
  deleteProject,
};
