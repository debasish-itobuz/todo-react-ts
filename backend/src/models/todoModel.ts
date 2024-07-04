import mongoose from "mongoose";
import { Status } from "../validators/todoValidators";

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
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
  },
  { timestamps: true }
);

export default mongoose.model("todos", todoSchema);
