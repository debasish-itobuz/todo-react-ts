import todoModel from "../models/todoModel";
import videoModel from "../models/videoModel";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/tokenVerify";
import { todoValidation } from "../validators/todoValidators";
import { catchBlock } from "../helper/commonCode";

// Controller function to create a new todo
const postTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { videoId, title, status } = req.body;

    const userId = (req as CustomRequest).userId;
    const data = await todoModel.create({
      title,
      status,
      userId,
      video: videoId,
    });
    // console.log("data", data);

    return res.status(200).send({
      data: data,
      message: "Data added successfully",
    });
  } catch (e: unknown) {
    return catchBlock(e, res, "Data not added");
  }
};

// Controller function to get all todos for a specific user
const getTodos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as CustomRequest).userId;
    const data = await todoModel
      .find({ userId })
      .populate({ path: "video", model: videoModel });
    // console.log("data", data);

    return res.status(200).send({
      data: data,
      message: "Data fetched successfully",
    });
  } catch (err) {
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
      .populate({ path: "video", model: videoModel });

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
      .populate({ path: "video", model: videoModel }); // Populate video references

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

// Controller function to filter todos by status
// const filterTodo = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { status } = req.query;
//     const data = await todoModel.find({ status }).populate("videoId");

//     return res.status(200).send({
//       data: data,
//       message: "Data fetched successfully",
//     });
//   } catch (err) {
//     console.log("Error", err);
//     return res.status(400).send({
//       data: null,
//       message: "Data not fetched",
//     });
//   }
// };


const filterTodo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.query;

    // Convert status to a string and ensure it's valid if provided
    const statusFilter = typeof status === 'string' ? status : undefined;

    const filter: { status?: string } = {};
    if (statusFilter) {
      filter.status = statusFilter;
    }

    // Fetch todos based on the filter and populate the `video` field
    const data = await todoModel
      .find(filter)
      .populate({
        path: "video",
        model: videoModel, // Populate video references
      });

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


export { postTodo, getTodos, getTodoById, updateTodo, deleteTodo, filterTodo };
