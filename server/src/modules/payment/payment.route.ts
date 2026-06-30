import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  createPaymentController,
  getPaymentController,
  getPaymentByQuotationController,
  getMyPaymentsController,
  getAllPaymentsController,
  updatePaymentController,
  verifyPaymentController,
  refundPaymentController,
  getPaymentStatisticsController,
} from "./payment.controller";

const router = Router();

// Admin routes
router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  createPaymentController
);

router.patch(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  updatePaymentController
);

router.patch(
  "/:id/verify",
  auth,
  authorize(Role.ADMIN),
  verifyPaymentController
);

router.patch(
  "/:id/refund",
  auth,
  authorize(Role.ADMIN),
  refundPaymentController
);

router.get(
  "/all",
  auth,
  authorize(Role.ADMIN),
  getAllPaymentsController
);

router.get(
  "/statistics",
  auth,
  authorize(Role.ADMIN),
  getPaymentStatisticsController
);

router.get(
  "/quotation/:quotationId",
  auth,
  authorize(Role.ADMIN),
  getPaymentByQuotationController
);

// Customer routes
router.get("/my", auth, getMyPaymentsController);

router.get("/:id", auth, getPaymentController);

export default router;