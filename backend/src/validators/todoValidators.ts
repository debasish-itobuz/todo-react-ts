import { z } from "zod";

export enum Status {
  toDo = "ToDo",
  completed = "Completed",
}

const options: ["ToDo", "Completed"] = ["ToDo", "Completed"];

const videoSchema = z.object({
  title: z
    .string({ message: "Video title is required" })
    .min(1, { message: "Video title is mandatory" }),
  url: z
    .string({ message: "Video URL is required" })
    .url({ message: "Invalid URL format" }),
  thumbnail: z
    .string({ message: "Thumbnail is required" })
    .url({ message: "Invalid URL format" }),
});

export const todoValidation = z
  .object({
    title: z
      .string({ message: "title is required" })
      .min(1, { message: "title is mandatory" }),
    status: z.enum(options, { message: "kindly provide correct status" }),
    videos: z.array(videoSchema).optional(),
  })
  .required();

export type Todo = z.infer<typeof todoValidation>;
