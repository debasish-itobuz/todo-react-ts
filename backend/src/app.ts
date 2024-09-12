import express, { Application, ErrorRequestHandler } from "express";
import { config } from "dotenv";
config();
import { env } from "./env";
import cors from "cors";
import todoRoutes from "./routes/todoRoute";
import userRoutes from "./routes/userRoute";
import connectToDb from "./config/dbConnection";
connectToDb();

const app: Application = express();
const PORT = env.PORT;

app.use(express.json());
app.use(cors());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Serve static files from the "thumbnail" directory
app.use("/thumbnail", express.static("thumbnail"));

app.use("/user", userRoutes);
app.use("/todo", todoRoutes);

// Error handler middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log({ err });
  if (err) {
    res.status(err.status || 500);
    res.send({
      status: err.status || 500,
      message: err.message,
    });
  } else next(res);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
