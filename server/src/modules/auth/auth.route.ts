import { Router } from "express";
import {
  register,
  login,
} from "./auth.controller";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import authorize from "../../middleware/authorize";
const router = Router();

router.post("/register", register);

router.post("/login", login);

// Test Protected Route
router.get("/test", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication Successful",
  });
});


router.get(
  "/admin-test",
  auth,
  authorize(Role.ADMIN),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

export default router;