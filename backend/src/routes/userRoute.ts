import { Router } from "express";
import {
  deleteUser,
  getUser,
  loginUser,
  postUser,
  updateUser,
  verifyEmail,
} from "../controllers/userController";

const router = Router();

router.post("/register", postUser);
router.post("/login", loginUser);
router.post('/verify-email', verifyEmail); 
router.delete("/delete", deleteUser);
router.put("/update", updateUser);
router.get('/get-user', getUser)
export default router;
