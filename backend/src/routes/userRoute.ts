import { Router } from "express";
import {
  deleteUser,
  getUser,
  loginUser,
  postUser,
  updateUser,
  verifyEmail,
} from "../controllers/userController";

import upload from "../multerConfig";

const router = Router();

router.post("/register", postUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.delete("/delete", deleteUser);
router.put("/update", updateUser);
router.get("/get-user", getUser);

router.post(
  "/upload-profile-picture",
  upload.single("profilePicture"),
  (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "Please upload a file." });
      }
      res.status(200).send({
        message: "File uploaded successfully",
        imageUrl: `/uploads/${file.filename}`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send({ message: "Failed to upload file." });
    }
  }
);

export default router;
