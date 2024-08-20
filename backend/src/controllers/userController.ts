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
      videos
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
    console.error("Error in postUser:", e); // Log the error
    return catchBlock(e, res, "User not added");
  }
};

const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (req?.file?.path) {
      const userId = req.query.id;
      const profilePicture = req.file.path;
      // console.log("obj",req.file.path )

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
  // console.log("...",req.file)
  try {
    if (req?.file?.path) {
      const userId = req.query.id;
      const videos = req.file;
      // console.log("obj", videos)

      // const allvideos = await userModel.findById(userId, 'videos');

      // console.log("allvideos", allvideos!.videos)

      if (!userId)
        return res.status(400).send({ message: "User ID is required" });

      const data = await userModel.findByIdAndUpdate(userId, {
        // videos: [...allvideos!.videos, {title: videos.filename, url: videos.path}]
         $push: { videos: {title: videos.filename, url: `http://localhost:4001/${videos.path}`}}

      });

      if (!data) return res.status(400).send({ message: "User not found" });

      return res.status(200).send({
        data: { ...data, videos },
        message: "video uploaded successfully",
      });
    } else {
      return res.status(400).send({ message: "Video path not recieved" });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    console.error("Error in uploadVideo:", e);
    return catchBlock(e, res, "Video not uploaded");
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
    const data = await userModel.findById(req.query.id);

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
    const user: User = req.body;
    userValidation.parse(user);

    // console.log("userupdated", user, req.query.id);

    const data = await userModel.findByIdAndUpdate(req.query.id, {
      ...user,
    });
    if (!data) return res.status(400).send({ message: "User not found" });
    return res
      .status(200)
      .send({ data: { ...data }, message: "User updated successfully" });

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
  uploadVideo
};
