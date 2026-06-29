import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createRepairRequest , getMyRepairRequests, getSingleRepairRequest,updateRepairRequest,cancelRepairRequest,} from "./repairRequest.service";

export const createRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);

    const result = await createRepairRequest(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Repair request created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);

    const result =
      await getMyRepairRequests(userId);

    res.status(200).json({
      success: true,
      message: "Repair requests fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);

    const requestId = Number(req.params.id);

    const result =
      await getSingleRepairRequest(
        userId,
        requestId
      );

    res.status(200).json({
      success: true,
      message:
        "Repair request details fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);
    const requestId = Number(req.params.id);

    const result = await updateRepairRequest(
      userId,
      requestId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Repair request updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);
    const requestId = Number(req.params.id);

    const result = await cancelRepairRequest(
      userId,
      requestId
    );

    res.status(200).json({
      success: true,
      message: "Repair request cancelled successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};