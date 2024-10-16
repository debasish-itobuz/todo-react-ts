import todoModel from "../models/todoModel";
import videoModel from "../models/videoModel";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/tokenVerify";
import { todoValidation } from "../validators/todoValidators";
import { catchBlock } from "../helper/commonCode";
import { sendTaskCompletionEmail } from "../EmailVerify/mailVerify"; // Import the sendTaskCompletionEmail function
import userModel from "../models/userModel"; // Import the user model

// Create a new todo with associated video ID(s)
const postTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { videoId, title } = req.body;
    const userId = (req as CustomRequest).userId;

    const data = await todoModel.create({
      title,
      userId,
      video: videoId,
      status: "ToDo",
    });

    return res.status(200).send({
      data: data,
      message: "Data added successfully",
    });
  } catch (e: unknown) {
    console.error("Error in postTodo:", e);
    return catchBlock(e, res, "Data not added");
  }
};

// Get all todos along with video data
const getTodos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as CustomRequest).userId;
    const { status } = req.query;

    const filter: { userId: string; status?: string } = { userId };

    if (status && typeof status === "string") {
      filter.status = status;
    }

    const data = await todoModel
      .find(filter)
      .populate({
        path: "video",
        select: "title url thumbnail", // Populate the video data
      })
      .select("title userId status video");

    return res.status(200).send({
      data: data,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log("Error", err);
    return res.status(400).send({
      data: null,
      message: "Data not fetched",
    });
  }
};

// Get a single todo by its ID
const getTodoById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await todoModel
      .findById(req.query.id)
      .populate({
        path: "video",
        select: "title url thumbnail",
      })
      .select("title userId status video");

    return res.status(200).send({
      data: data,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log("Error", err);
    return res.status(400).send({
      data: null,
      message: "Data not fetched",
    });
  }
};

// Update a todo with associated video ID(s) and trigger email on completion
const updateTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { videoId, ...todo } = req.body;

    todoValidation.parse({ ...todo, videoId });

    if (videoId && Array.isArray(videoId)) {
      for (const id of videoId) {
        const video = await videoModel.findById(id);
        if (!video) {
          return res.status(400).send({ message: `Invalid video ID: ${id}` });
        }
      }
    }

    const data = await todoModel
      .findByIdAndUpdate(
        req.query.id,
        { ...todo, video: videoId },
        { new: true }
      )
      .populate({
        path: "video",
        select: "title url thumbnail",
      })
      .select("title userId status video");

    // Fetch the user details based on the userId from the todo data
    const user = await userModel.findById(data?.userId).select("email");

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Check if the status is changed to "Completed"
    if (data?.status === "Completed") {
      const userEmail = user.email; // Get the user's email
      await sendTaskCompletionEmail(userEmail, data.title); // Send the task completion email
    }

    return res.status(200).send({
      data: data,
      message: "Data updated successfully",
    });
  } catch (e: unknown) {
    return catchBlock(e, res, "Data not updated");
  }
};


// Delete a todo by its ID
const deleteTodo = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const data = await todoModel.findByIdAndDelete(req.query.id);
    return res.status(200).send({
      data: data,
      message: "Data Deleted successfully",
    });
  } catch (err) {
    console.log("Error", err);
    return res.status(400).send({
      data: null,
      message: "Data not deleted",
    });
  }
};

export { postTodo, getTodos, getTodoById, updateTodo, deleteTodo };
