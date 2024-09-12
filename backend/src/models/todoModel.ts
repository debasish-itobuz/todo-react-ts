import mongoose, { Schema, Document } from "mongoose";
import { Status } from "../validators/todoValidators";

interface Todo extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  status: string;
  video?: mongoose.Schema.Types.ObjectId; // Store reference to a video
}

const todoSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: [Status.toDo, Status.completed],
      required: true,
    },
    video: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], // Reference to the video
  },
  { timestamps: true }
);

export default mongoose.model<Todo>("Todo", todoSchema);
