import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import authorize from "../../middleware/authorize";
import {
  createAppointmentController,
  getAppointmentController,
  getAppointmentByRepairRequestController,
  getMyAppointmentsController,
  updateAppointmentController,
  cancelAppointmentController,
  getUpcomingAppointmentsController,
} from "./appointment.controller";

const router = Router();


router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  createAppointmentController
);

router.patch(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  updateAppointmentController
);

router.patch(
  "/:id/cancel",
  auth,
  authorize(Role.ADMIN),
  cancelAppointmentController
);

router.get(
  "/repair-request/:repairRequestId",
  auth,
  authorize(Role.ADMIN),
  getAppointmentByRepairRequestController
);

router.get(
  "/upcoming",
  auth,
  authorize(Role.ADMIN),
  getUpcomingAppointmentsController
);


router.get("/my", auth, getMyAppointmentsController);

router.get("/:id", auth, getAppointmentController);

export default router;