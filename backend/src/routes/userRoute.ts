import { Router } from "express";
import {
  deleteUser,
  getUser,
  loginUser,
  postUser,
  updateUser,
} from "../controllers/userController";

const router = Router();

router.post("/register", postUser);
router.post("/login", loginUser);
router.delete("/delete", deleteUser);
router.put("/update", updateUser);
router.get('/get-user', getUser)
export default router;
