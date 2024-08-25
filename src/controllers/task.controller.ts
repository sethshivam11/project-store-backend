import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import Task from "../models/task.model";
import { ApiResponse } from "../utils/ApiResponse";
import Project from "../models/project.model";

const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { projectId } = req.params;
  const { title, description, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    dueDate,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(500, "Task could not be created");
  }

  return res.json(new ApiResponse(201, task, "Task created successfully"));
});

const getUserTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { userId } = req.params;

  const tasks = await Task.find({ assignedTo: userId });
  if (!tasks || !tasks.length) {
    throw new ApiError(404, "No tasks found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

const getProjectTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId });
  if (!tasks || !tasks.length) {
    throw new ApiError(404, "No tasks found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

const assignTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId, userId } = req.body;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "You cannot assign tasks to this project");
  }

  if (task.assignedTo?.toString() === _id.toString()) {
    throw new ApiError(400, "This task is already assigned to the user");
  }

  task.assignedTo = userId;
  await task.save();

  return res.json(new ApiResponse(200, task, "Task assigned successfully"));
});

const unassignTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId } = req.body;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "You cannot unassign tasks from this project");
  }

  if (task.assignedTo?.toString() !== _id.toString()) {
    throw new ApiError(400, "This task is already unassigned");
  }

  task.assignedTo = null;
  await task.save();

  return res.json(new ApiResponse(200, task, "Task unassigned successfully"));
});

const markAsComplete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(
      401,
      "You cannot mark tasks as complete in this project"
    );
  }

  if (task.completed) {
    throw new ApiError(400, "This task is already marked as complete");
  }

  task.completed = true;
  await task.save();

  return res.json(
    new ApiResponse(200, {}, "Task marked as complete successfully")
  );
});

const markAsIncomplete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(
      401,
      "You cannot mark tasks as complete in this project"
    );
  }

  if (!task.completed) {
    throw new ApiError(400, "This task is already marked as incomplete");
  }

  task.completed = false;
  await task.save();

  return res.json(
    new ApiResponse(200, {}, "Task marked as incomplete successfully")
  );
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId } = req.params;
  const { title, description, dueDate } = req.body;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "You cannot update tasks in this project");
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (dueDate) task.dueDate = dueDate;

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { _id } = req.user;
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const project = await Project.findOne({ _id: task.project });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.admin.toString() !== _id.toString()) {
    throw new ApiError(401, "You cannot delete tasks in this project");
  }

  await task.deleteOne();

  return res.json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export {
  createTask,
  getUserTasks,
  getProjectTasks,
  assignTask,
  unassignTask,
  markAsComplete,
  updateTask,
  markAsIncomplete,
  deleteTask,
};
