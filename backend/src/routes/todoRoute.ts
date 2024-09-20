import { Router } from "express";
import verifyToken from "../middlewares/tokenVerify";
import validateData from "../middlewares/validateData"; // Import the middleware
import { todoValidation } from "../validators/todoValidators"; // Import the schema
import {
  deleteTodo,
  getTodos,
  getTodoById,
  postTodo,
  updateTodo,
} from "../controllers/todoController";

const router = Router();

router.use(verifyToken);

router.post("/create", validateData(todoValidation), postTodo);
router.get("/get", getTodos);
router.get("/get-by-id",  getTodoById);
router.put("/update", validateData(todoValidation), updateTodo);
router.delete("/delete", deleteTodo);

export default router;
