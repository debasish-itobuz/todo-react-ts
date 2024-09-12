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

import {
  uploadVideo,
  deleteVideo,
  getUserVideos,
} from "../controllers/videoController";
import upload from "../multerConfig";

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

router.post("/upload-video", upload.single("videos"), uploadVideo);
router.get("/get-videos", getUserVideos);
router.delete("/delete-video", deleteVideo);

export default router;
