import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import repairRequestRoutes from "../modules/repairRequest/repairRequest.route";
import adminRoutes from "../modules/admin/admin.route";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/repair-requests", repairRequestRoutes);
router.use("/admin", adminRoutes);

export default router;