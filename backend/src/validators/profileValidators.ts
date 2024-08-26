import { z } from "zod";

export const profileValidation = z
  .object({
    firstName: z.string({ message: "firstName is required" }),
    lastName: z.string({ message: "lastName is required" }),
    phone: z.string({ message: "phone is required" }),
    profilePicture: z.string({ message: "profilePicture is required" }),
    videos: z.array(
      z.object({
        url: z.string({ message: "video url is required" }),
        _id: z.string({ message: "id is required" }),
      })
    ),
    academics: z.array(
      z.object({
        title: z.string({ message: "title is required" }),
        year: z.number({ message: "year is required" }),
      })
    ),
  })
  .required();

export type Profile = z.infer<typeof profileValidation>;
