import mongoose from "mongoose";

const connectToDb = async () => {
  const connectUrl = process.env.CONNECTION_STRING;
  try {
    await mongoose.connect(`${connectUrl}`);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

export default connectToDb;
