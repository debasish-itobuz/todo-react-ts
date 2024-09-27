import todoModel from "../models/todoModel";
import videoModel from "../models/videoModel";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/tokenVerify";
import { todoValidation } from "../validators/todoValidators";
import { catchBlock } from "../helper/commonCode";

const postTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { videoId, title } = req.body;
    const userId = (req as CustomRequest).userId;

    console.log("userId", userId);

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

// Controller function to get all todos for a specific user with optional status filter
const getTodos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as CustomRequest).userId;
    const { status } = req.query;

    // Build the filter based on userId and optional status
    const filter: { userId: string; status?: string } = { userId };

    // If status is provided, add it to the filter
    if (status && typeof status === "string") {
      filter.status = status;
    }

    // Find todos based on the filter and populate the video field
    const data = await todoModel
      .find(filter)
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

// Controller function to get a todo by its ID
const getTodoById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await todoModel
      .findById(req.query.id)
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

// Controller function to update a todo by its ID
const updateTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("query", req.query);
    const { videoId, ...todo } = req.body;

    todoValidation.parse({ ...todo, videoId }); // Validate the todo data

    if (videoId && Array.isArray(videoId)) {
      // Loop through and validate each video ID
      for (const id of videoId) {
        const video = await videoModel.findById(id);
        if (!video) {
          return res.status(400).send({ message: `Invalid video ID: ${id}` });
        }
      }
    }

    // Update the todo with multiple video IDs
    const data = await todoModel
      .findByIdAndUpdate(
        req.query.id,
        { ...todo, video: videoId }, // Update with the array of video IDs
        { new: true }
      )
      .select("title userId status video");

    return res.status(200).send({
      data: data,
      message: "Data updated successfully",
    });
  } catch (e: unknown) {
    return catchBlock(e, res, "Data not updated");
  }
};

// Controller function to delete a todo by its ID
const deleteTodo = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
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
