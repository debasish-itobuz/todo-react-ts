import { Router } from "express";
import {
  deleteUser,
  getUser,
  loginUser,
  postUser,
  updateUser,
  verifyEmail,
  uploadProfilePicture,
} from "../controllers/userController";
import upload from "../multerConfig"; // Import the upload middleware

const router = Router();

router.post("/register", upload.single("profilePicture"), postUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.delete("/delete", deleteUser);
router.put("/update", updateUser);
router.get("/get-user", getUser);
router.post(
  "/upload-profile",
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
