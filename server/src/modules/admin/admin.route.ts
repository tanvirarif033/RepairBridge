import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  dashboardStatistics,
  getAllUsersController,
  changeUserRoleController,
  toggleUserStatusController,
} from "./admin.controller";

const router = Router();

// Repair Requests
router.get(
  "/repair-requests",
  auth,
  authorize(Role.ADMIN),
  getAllRequests
);

router.patch(
  "/repair-requests/:id/approve",
  auth,
  authorize(Role.ADMIN),
  approveRequest
);

router.patch(
  "/repair-requests/:id/reject",
  auth,
  authorize(Role.ADMIN),
  rejectRequest
);

router.patch(
  "/repair-requests/:id/cancel",
  auth,
  authorize(Role.ADMIN),
  cancelRequest
);

// Dashboard
router.get(
  "/dashboard",
  auth,
  authorize(Role.ADMIN),
  dashboardStatistics
);

// Users
router.get(
  "/users",
  auth,
  authorize(Role.ADMIN),
  getAllUsersController
);

// NEW: Change user role
router.patch(
  "/users/:id/role",
  auth,
  authorize(Role.ADMIN),
  changeUserRoleController
);

// NEW: Toggle user status
router.patch(
  "/users/:id/status",
  auth,
  authorize(Role.ADMIN),
  toggleUserStatusController
);

export default router;