import { Request, Response } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import { User, userValidation } from "../validators/userValidators";
import { catchBlock } from "../helper/commonCode";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ZodError } from "zod";
import { sendVerificationEmail } from "../EmailVerify/mailVerify";
import crypto from "crypto";
import todoModel from "../models/todoModel";
import { profileValidation } from "../validators/profileValidators";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

const generateVerificationToken = (): string => {
  return crypto.randomBytes(20).toString("hex");
};

const postUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    userValidation.parse(user);

    const verificationToken = generateVerificationToken();
    const alreadyExistUser = await userModel.findOne({ email: user.email });
    if (alreadyExistUser)
      return res.status(400).send({ message: "User already exists" });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    const profilePicture = req.file ? req.file.path : "";
    const videos = req.file ? req.file.path : [];

    const data = await userModel.create({
      ...user,
      password: hashedPassword,
      verificationToken,
      profilePicture,
      videos,
    });

    const isEmailSent = await sendVerificationEmail(
      data.email,
      data.verificationToken
    );

    if (isEmailSent) {
      console.log("Verification link sent successfully!");
    } else {
      console.log("Failed to send verification link.");
    }

    res.status(200).send({ data, message: "User added successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    console.error("Error in postUser:", e);
    return catchBlock(e, res, "User not added");
  }
};

const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (req?.file?.path) {
      const userId = req.query.id;
      const profilePicture = req.file.path;

      if (!userId)
        return res.status(400).send({ message: "User ID is required" });

      const data = await userModel.findByIdAndUpdate(userId, {
        profilePicture,
      });

      if (!data) return res.status(400).send({ message: "User not found" });

      return res.status(200).send({
        data: { ...data, profilePicture },
        message: "Profile picture uploaded successfully",
      });
    } else {
      return res.status(400).send({ message: "Profile path not recieved" });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    console.error("Error in uploadProfilePicture:", e);
    return catchBlock(e, res, "Profile picture not uploaded");
  }
};


const uploadVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.query.id as string;
    const video = req.file;

    if (!video) {
      return res.status(400).send({ message: "Video not received" });
    }

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const thumbnailPath = path.join(
      "thumbnails",
      `${path.parse(video.filename).name}.png`
    );

    console.log("thumb:", thumbnailPath);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(video.path)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .screenshots({
          timestamps: ["50%"], // Capture a frame at 50% of the video duration
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
        });
    });

    const data = await userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          videos: {
            title: video.filename,
            url: video.path,
            thumbnail: thumbnailPath, // Save the thumbnail URL
          },
        },
      },
      { new: true }
    );

    if (!data) return res.status(400).send({ message: "User not found" });

    const response = {
      id: data.id,
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      profilePicture: data.profilePicture,
      phone: data.phone,
      videos: data.videos,
      academics: data.academics,
      createdAt: data.createdAt,
    };

    return res.status(200).send({
      data: response,
      message: "Video uploaded successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("Error in uploadVideo:", e);
    return catchBlock(e, res, "Video not uploaded");
  }
};

const deleteVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const videoId = req.query.videoId as string;

    // console.log("Received userId:", userId);
    // console.log("Received videoId:", videoId);

    if (!userId || !videoId) {
      return res
        .status(400)
        .send({ message: "User ID and Video ID are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const videoIndex = user.videos.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (video) => (video as any)._id.toString() === videoId
    );

    if (videoIndex === -1) {
      return res.status(404).send({ message: "Video not found" });
    }

    user.videos.splice(videoIndex, 1);
    await user.save();

    return res.status(200).send({
      data: user,
      message: "Video deleted successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    console.error("Error in deleteVideo:", e);
    return catchBlock(e, res, "Video not deleted");
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    const { email, password } = user;
    userValidation.parse(user);
    const data = await userModel.findOne({ email });
    if (!data) return res.status(400).send({ message: "User doesnot exists" });

    const isCorrectPassword = bcrypt.compareSync(password, data.password);
    if (data && isCorrectPassword) {
      const token = jwt.sign(
        { user: { userId: data._id, email: data.email } },
        `${process.env.SECRET_KEY}`,
        { expiresIn: "10d" }
      );
      return res.status(200).send({
        data: { token, email: data.email, id: data._id },
        message: "User logged in successfully",
      });
    } else {
      return res.status(400).send({ message: "Credentials not correct" });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "User not loged in");
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const data = await userModel.findById(req.query.id, { password: 0 });

    if (!data) return res.status(400).send({ message: "User not found" });
    return res
      .status(200)
      .send({ data: data, message: "User found successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "User not updated");
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    profileValidation.parse(req.body);
    const { firstName, lastName, phone, academics, profilePicture } = req.body;

    const data = await userModel.findByIdAndUpdate(req.query.id, {
      firstName,
      lastName,
      phone,
      academics,
      profilePicture,
    });

    const updatedData = await userModel.findById(req.query.id);
    if (!data) return res.status(400).send({ message: "User not found" });
    return res
      .status(200)
      .send({ data: { ...updatedData }, message: "User updated successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "User not updated");
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.query.id);
    const delUser = await userModel.findByIdAndDelete(req.query.id);
    const todoData = await todoModel.deleteMany({ userId: user?.id });
    console.log(todoData);

    if (!user)
      return res.status(400).send({ data: delUser, message: "User not found" });
    return res
      .status(200)
      .send({ data: user, message: "User Deleted Successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return catchBlock(e, res, "User not deleted");
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const user = await userModel.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found or token expired" });
    }

    user.verified = true;
    user.verificationToken = "";

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

export {
  postUser,
  loginUser,
  updateUser,
  deleteUser,
  getUser,
  verifyEmail,
  uploadProfilePicture,
  uploadVideo,
  deleteVideo,
};
