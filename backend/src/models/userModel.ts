import mongoose, { Document } from "mongoose";

export interface Academic {
  title: string;
  year: number;
}

export interface User extends Document {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  academics: Academic[];
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
      type: [academicSchema], // Array of academic objects
      default: [], // Default is an empty array
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
