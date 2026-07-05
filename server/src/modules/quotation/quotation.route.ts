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
  adminUpdateQuotationController,
} from "./quotation.controller";

const router = Router();



router.get("/my", auth, getMyQuotationsController);


router.get("/:id", auth, getQuotationController);


router.patch("/:id/action", auth, customerQuotationActionController);



router.post("/", auth, authorize(Role.ADMIN), createQuotationController);


router.patch("/:id", auth, authorize(Role.ADMIN), updateQuotationController);


router.patch("/:id/admin", auth, authorize(Role.ADMIN), adminUpdateQuotationController);


router.get(
  "/repair-request/:repairRequestId",
  auth,
  authorize(Role.ADMIN),
  getQuotationsByRepairRequestController
);


export default router;