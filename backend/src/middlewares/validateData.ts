import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Middleware to validate the data
const validateData = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Validate the request body against the schema
      next(); // If validation is successful, proceed to the next middleware or controller
    } catch (err: unknown) {
      return res.status(400).send({ message: err || "Invalid request data" });
    }
  };
};

export default validateData;
