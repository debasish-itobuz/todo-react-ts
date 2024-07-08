import mongoose, { Document } from "mongoose";

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
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
    email: {
      type: String,
      required: true,
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