import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  userId: string;
}

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];

      if (!token) {
        throw new Error("Token is missing");
      }

      jwt.verify(token, `${process.env.SECRET_KEY}`, (err, decoded) => {
        if (err) {
          throw new Error("Wrong Token");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as CustomRequest).userId = (decoded as any).user.userId;
        next();
      });
    } else {
      res.status(401).send("Token is missing");
    }
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
}

export default verifyToken;
