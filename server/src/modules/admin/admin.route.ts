import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  getAllRequests,
  getRequestByIdController,
  approveRequest,
  rejectRequest,
  cancelRequest,
  dashboardStatistics,
  getAllUsersController,
  changeUserRoleController,
  toggleUserStatusController,
  getAllQuotationsController,
  getQuotationByIdController,
  createQuotationController,
  updateQuotationController,
  deleteQuotationController,
  adminUpdateQuotationController,
  updateQuotationServiceCenterController, // ✅ Import added
  getAllAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentStatusController,
  createAppointmentController,
  cancelAppointmentController,
} from "./admin.controller";

const router = Router();

// ==================== REPAIR REQUESTS ====================
router.get(
  "/repair-requests",
  auth,
  authorize(Role.ADMIN),
  getAllRequests
);

router.get(
  "/repair-requests/:id",
  auth,
  authorize(Role.ADMIN),
  getRequestByIdController
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

// ==================== DASHBOARD ====================
router.get(
  "/dashboard",
  auth,
  authorize(Role.ADMIN),
  dashboardStatistics
);

// ==================== USERS ====================
router.get(
  "/users",
  auth,
  authorize(Role.ADMIN),
  getAllUsersController
);

router.patch(
  "/users/:id/role",
  auth,
  authorize(Role.ADMIN),
  changeUserRoleController
);

router.patch(
  "/users/:id/status",
  auth,
  authorize(Role.ADMIN),
  toggleUserStatusController
);

// ==================== QUOTATIONS ====================
router.get(
  "/quotations",
  auth,
  authorize(Role.ADMIN),
  getAllQuotationsController
);

router.get(
  "/quotations/:id",
  auth,
  authorize(Role.ADMIN),
  getQuotationByIdController
);

router.post(
  "/quotations",
  auth,
  authorize(Role.ADMIN),
  createQuotationController
);

router.patch(
  "/quotations/:id",
  auth,
  authorize(Role.ADMIN),
  updateQuotationController
);

router.patch(
  "/quotations/:id/admin",
  auth,
  authorize(Role.ADMIN),
  adminUpdateQuotationController
);

router.patch(
  "/quotations/:id/service-center", // ✅ Route added
  auth,
  authorize(Role.ADMIN),
  updateQuotationServiceCenterController
);

router.delete(
  "/quotations/:id",
  auth,
  authorize(Role.ADMIN),
  deleteQuotationController
);

// ==================== APPOINTMENTS ====================
router.get(
  "/appointments",
  auth,
  authorize(Role.ADMIN),
  getAllAppointmentsController
);

router.get(
  "/appointments/:id",
  auth,
  authorize(Role.ADMIN),
  getAppointmentByIdController
);

router.post(
  "/appointments",
  auth,
  authorize(Role.ADMIN),
  createAppointmentController
);

router.patch(
  "/appointments/:id/status",
  auth,
  authorize(Role.ADMIN),
  updateAppointmentStatusController
);

router.patch(
  "/appointments/:id/cancel",
  auth,
  authorize(Role.ADMIN),
  cancelAppointmentController
);

export default router;