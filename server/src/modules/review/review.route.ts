import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  createReviewController,
  getReviewController,
  getReviewByRepairRequestController,
  getMyReviewsController,
  getAllReviewsController,
  updateReviewController,
  deleteReviewController,
  getReviewStatisticsController,
  getServiceCenterRatingsController,
} from "./review.controller";

const router = Router();


router.post("/", auth, createReviewController);

router.get("/my", auth, getMyReviewsController);

router.patch("/:id", auth, updateReviewController);

router.delete("/:id", auth, deleteReviewController);


router.get("/repair-request/:repairRequestId", getReviewByRepairRequestController);

router.get("/service-centers/ratings", getServiceCenterRatingsController);

router.get("/:id", getReviewController);


router.get(
  "/all",
  auth,
  authorize(Role.ADMIN),
  getAllReviewsController
);

router.get(
  "/statistics",
  auth,
  authorize(Role.ADMIN),
  getReviewStatisticsController
);

export default router;