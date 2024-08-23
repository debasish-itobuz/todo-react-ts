import todoModel from "../models/todoModel";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/tokenVerify";
import { Todo, todoValidation } from "../validators/todoValidators";
import { catchBlock } from "../helper/commonCode";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ZodError } from "zod";

const postTodo = async (req: Request, res: Response) => {
  try {
    const todo: Todo = req.body;
    todoValidation.parse(todo);
    const userId = (req as CustomRequest).userId;
    const data = await todoModel.create({ ...todo, userId });
    return res.status(200).send({
      data: data,
      message: "Data added successfully",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "Data not added");
  }
};

const getTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;
    const data: Todo[] = await todoModel.find({ userId });
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

const getTodoById = async (req: Request, res: Response) => {
  try {
    const data = await todoModel.findById(req.query.id);
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

const updateTodo = async (req: Request, res: Response) => {
  try {
    const todo: Todo = req.body;
    todoValidation.parse(todo);
    const data = await todoModel.findByIdAndUpdate(req.query.id, todo);
    return res.status(200).send({
      data: data,
      message: "Data updated successfully",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "Data not updated");
  }
};

const deleteTodo = async (req: Request, res: Response) => {
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

const filterTodo = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const data = await todoModel.find({ status: status });
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
