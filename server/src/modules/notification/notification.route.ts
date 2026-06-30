import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  createNotificationController,
  getNotificationController,
  getMyNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  deleteAllNotificationsController,
  getUnreadCountController,
} from "./notification.controller";

const router = Router();

// Customer routes (authenticated users)
router.get("/my", auth, getMyNotificationsController);

router.get("/unread/count", auth, getUnreadCountController);

router.get("/:id", auth, getNotificationController);

router.patch("/:id/read", auth, markAsReadController);

router.patch("/read-all", auth, markAllAsReadController);

router.delete("/:id", auth, deleteNotificationController);

router.delete("/delete-all", auth, deleteAllNotificationsController);

// Admin routes
router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  createNotificationController
);

export default router;