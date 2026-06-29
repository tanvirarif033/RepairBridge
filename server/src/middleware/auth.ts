import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
interface JwtPayload {
  id: string;
  email: string;
   role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const auth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get Authorization Header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access. No token provided.",
      });
    }

    // Remove "Bearer " if it exists
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Save decoded user in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default auth;