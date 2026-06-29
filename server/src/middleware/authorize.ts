import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth";

const authorize = (...roles: Role[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden Access",
      });
    }

    next();
  };
};

export default authorize;