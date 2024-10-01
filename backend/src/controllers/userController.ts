import { Request, Response } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import { User, userValidation } from "../validators/userValidators";
import { catchBlock, evaluateStrongPassword } from "../helper/commonCode";
import { sendVerificationEmail } from "../EmailVerify/mailVerify";
import crypto from "crypto";
import todoModel from "../models/todoModel";
import { profileValidation } from "../validators/profileValidators";
import { CustomRequest } from "../middlewares/tokenVerify";

const generateVerificationToken = (): string => {
  return crypto.randomBytes(20).toString("hex");
};

const postUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    userValidation.parse(user);

    // Evaluate password strength
    const passwordStrength = evaluateStrongPassword(user.password);
    if (passwordStrength === "Weak" || passwordStrength === "Medium") {
      return res.status(400).send({
        message: "Password too weak. Please choose a strong Password",
      });
    }

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
  } catch (e: unknown) {
    console.error("Error in postUser:", e);
    return catchBlock(e, res, "User not added");
  }
};

const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (req?.file?.path) {
      const userId = (req as CustomRequest).userId;
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
  } catch (e: unknown) {
    console.error("Error in uploadProfilePicture:", e);
    return catchBlock(e, res, "Profile picture not uploaded");
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    const { email, password } = user;
    userValidation.parse(user);
    const data = await userModel.findOne({ email });
    if (!data) return res.status(400).send({ message: "User doesnot exists" });

    if (!data?.verified) {
      return res.status(403).send({ message: "User not verified!" });
    }

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
  } catch (e: unknown) {
    return catchBlock(e, res, "User not loged in");
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;
    const data = await userModel
      .findById(userId, { password: 0 })
      .populate("videos");

    if (!data) return res.status(400).send({ message: "User not found" });
    return res
      .status(200)
      .json({ data: data, message: "User found successfully" });
  } catch (e: unknown) {
    return catchBlock(e, res, "User not updated");
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;

    profileValidation.parse(req.body);
    const { firstName, lastName, phone, academics, profilePicture } = req.body;

    const data = await userModel.findByIdAndUpdate(userId, {
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
      .json({ data: updatedData, message: "User updated successfully" });
  } catch (e: unknown) {
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
  } catch (e: unknown) {
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
};
