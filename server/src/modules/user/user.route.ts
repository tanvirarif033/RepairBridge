import { Router } from "express";
import auth from "../../middleware/auth";
import { uploadSingle } from "../../middleware/multer";

import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from "./user.controller";

const router = Router();

router.get("/me", auth, getProfile);

router.patch("/me", auth, updateProfile);

router.patch("/profile-image",auth,uploadSingle,updateProfileImage);

export default router;