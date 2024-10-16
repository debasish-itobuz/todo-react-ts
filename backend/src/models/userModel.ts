import mongoose, { Document } from "mongoose";
import videoModel from "./videoModel";

export interface Academic {
  title: string;
  year: number;
}

export interface Video {
  title: string;
  url: string;
  thumbnail: string;
  id: string;
}

export interface User extends Document {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  academics: Academic[];
  videos: Video[];
  password: string;
  profilePicture: string;
  verified: boolean;
  verificationToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const academicSchema = new mongoose.Schema<Academic>({
  title: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

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
    academics: {
      type: [academicSchema],
      default: [],
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: videoModel,
      },
    ],
    password: {
      type: String,
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
