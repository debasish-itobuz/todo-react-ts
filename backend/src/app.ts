import express, { Application, ErrorRequestHandler } from "express";
// import bodyParser from "body-parser";
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

// app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.use("/todo", todoRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
