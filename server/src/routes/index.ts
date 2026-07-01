import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import repairRequestRoutes from "../modules/repairRequest/repairRequest.route";
import adminRoutes from "../modules/admin/admin.route";
import quotationRoutes from "../modules/quotation/quotation.route";
import appointmentRoutes from "../modules/appointment/appointment.route";
import paymentRoutes from "../modules/payment/payment.route";
import reviewRoutes from "../modules/review/review.route";
import notificationRoutes from "../modules/notification/notification.route";
import dashboardRoutes from "../modules/dashboard/dashboard.route";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/users", userRoutes);
router.use("/repair-requests", repairRequestRoutes);
router.use("/admin", adminRoutes);
router.use("/quotations", quotationRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/dashboard", dashboardRoutes); // Make sure this line exists

export default router;