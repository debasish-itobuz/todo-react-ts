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

// Controller function to get all todos
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
