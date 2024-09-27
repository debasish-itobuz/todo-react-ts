import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  userId: string;
}

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Token is missing");
    }

    jwt.verify(token, `${process.env.SECRET_KEY}`, (err, decoded) => {
      if (err) {
        return res.status(401).send("Token is malformed");
      }

      (req as CustomRequest).userId = (decoded as jwt.JwtPayload).user.userId;
      next();
    });
  } else {
    res.status(401).send("Token is missing");
  }
}

export default verifyToken;
