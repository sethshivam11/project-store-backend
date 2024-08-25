import mongoose, { Schema, ObjectId, Document } from "mongoose";

export interface TaskI extends Document {
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  assignedTo: ObjectId | null;
  project: ObjectId;
}

const TaskSchema = new Schema<TaskI>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
    default: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "project",
  },
});

const Task = mongoose.model("task", TaskSchema);
export default Task;
