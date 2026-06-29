import { Router } from "express";
import auth from "../../middleware/auth";
import {createRequest,getMyRequests,getSingleRequest,updateRequest,cancelRequest,} from "./repairRequest.controller";

const router = Router();

router.post("/", auth, createRequest);

router.get("/", auth, getMyRequests);

router.get("/:id", auth, getSingleRequest);

router.patch("/:id", auth, updateRequest);

router.patch("/:id/cancel", auth, cancelRequest);

export default router;