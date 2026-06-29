import { Router } from "express";
import { Role } from "@prisma/client";

import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import { getAllRequests,approveRequest, rejectRequest,cancelRequest,dashboardStatistics, } from "./admin.controller";

const router = Router();

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
router.get(
  "/dashboard",
  auth,
  authorize(Role.ADMIN),
  dashboardStatistics
);
export default router;