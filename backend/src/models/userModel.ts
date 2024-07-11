import mongoose, { Document } from "mongoose";

export interface User extends Document {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  password: string;
  profilePicture: string;
  verified: boolean;
  verificationToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<User>(
  {
    userName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    phone: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
