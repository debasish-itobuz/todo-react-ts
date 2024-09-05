import mongoose from "mongoose";
import { Status } from "../validators/todoValidators";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: false,
  },
});

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [Status.toDo, Status.completed],
      required: true,
    },
    videos: {
      type: [videoSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
