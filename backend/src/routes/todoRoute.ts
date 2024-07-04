import { Router } from "express";
import verifyToken from "../middlewares/tokenVerify";
import {
  deleteTodo,
  filterTodo,
  getTodos,
  getTodoById,
  postTodo,
  updateTodo,
} from "../controllers/todoController";

const router = Router();

router.use(verifyToken);

router.post("/create", postTodo);
router.get("/get", getTodos);
router.get("/get-by-id", getTodoById);
router.get("/get-by-filter", filterTodo);
router.put("/update", updateTodo);
router.delete("/delete", deleteTodo);

export default router;
