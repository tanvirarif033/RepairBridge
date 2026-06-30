import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  createQuotationController,
  getQuotationController,
  getQuotationsByRepairRequestController,
  updateQuotationController,
  customerQuotationActionController,
  getMyQuotationsController,
} from "./quotation.controller";

const router = Router();


router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  createQuotationController
);

router.patch(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  updateQuotationController
);

router.get(
  "/repair-request/:repairRequestId",
  auth,
  authorize(Role.ADMIN),
  getQuotationsByRepairRequestController
);


router.get("/my", auth, getMyQuotationsController);

router.get("/:id", auth, getQuotationController);

router.patch(
  "/:id/action",
  auth,
  customerQuotationActionController
);

export default router;