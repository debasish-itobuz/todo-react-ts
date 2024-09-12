import { z } from "zod";

export enum Status {
  toDo = "ToDo",
  completed = "Completed",
}

const options: ["ToDo", "Completed"] = ["ToDo", "Completed"];

export const todoValidation = z
  .object({
    title: z
      .string({ message: "title is required" })
      .min(1, { message: "title is mandatory" }),
    status: z.enum(options, { message: "kindly provide correct status" }),
    videoId: z.array(z.string({ message: "VideoId is required" })),
  })
  .required();

export type Todo = z.infer<typeof todoValidation>;
