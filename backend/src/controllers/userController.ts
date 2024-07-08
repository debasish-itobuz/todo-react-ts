import userModel from "../models/userModel";
import todoModel from "../models/todoModel";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config();
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User, userValidation } from "../validators/userValidators";
import { catchBlock } from "../helper/commonCode";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ZodError } from "zod";
import { sendVerificationEmail } from "../EmailVerify/mailVerify";
import crypto from "crypto";

const generateVerificationToken = (): string => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
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
    const data = await userModel.create({
      ...user,
      password: hashedPassword,
      verificationToken: verificationToken,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const check: any = await sendVerificationEmail(
      data.email,
      data.verificationToken
    );
    console.log("check = ", check);

    if (check) {
      console.log("Verification send successfully!");
    }

    return res
      .status(200)
      .send({ data: data, message: "User added successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any | ZodError) {
    return catchBlock(e, res, "User not added");
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
    // console.log(data)
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

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    const data = await userModel.findByIdAndUpdate(req.query.id, {
      ...user,
      hashedPassword,
    });
    if (!data) return res.status(400).send({ message: "User not found" });
    return res
      .status(200)
      .send({ data: data, message: "User updated successfully" });

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
    // Find the user by the verification token
    const user = await userModel.findOne({ verificationToken: token });
    console.log("user=", user);

    if (!user) {
      return res.status(404).json({ error: "User not found or token expired" });
    }

    // Mark the user as verified (update your User schema accordingly)
    user.verified = true;
    user.verificationToken = "";

    // Save the updated user
    const check = await user.save();
    console.log("check=", check);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

export { postUser, loginUser, updateUser, deleteUser, getUser, verifyEmail };
