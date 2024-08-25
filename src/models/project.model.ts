import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface ProjectI extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  image: string;
  admin: ObjectId[];
  active: boolean;
  dueDate: Date;
  tasks: ObjectId[];
}

const ProjectSchema: Schema<ProjectI> = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: false,
    default: ""
  },
  endDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  admin: [{
    type: Schema.Types.ObjectId,
    ref: "user",
  }],
});

const Project = mongoose.model("project", ProjectSchema);
export default Project;
