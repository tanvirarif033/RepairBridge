import { Router } from "express";
import {
  register,
  login,
} from "./auth.controller";
import auth from "../../middleware/auth";

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

export default router;