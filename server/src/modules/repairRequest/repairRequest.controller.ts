import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { 
  createRepairRequest, 
  getMyRepairRequests, 
  getSingleRepairRequest,
  updateRepairRequest,
  cancelRepairRequest,
} from "./repairRequest.service";

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

// FIXED: Added pagination, search, filter parameters
export const getMyRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);

    // Get query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';

    const result = await getMyRepairRequests(
      userId,
      page,
      limit,
      search,
      status
    );

    res.status(200).json({
      success: true,
      message: "Repair requests fetched successfully",
      data: result.data,
      meta: result.meta,
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

    const result = await getSingleRepairRequest(
      userId,
      requestId
    );

    res.status(200).json({
      success: true,
      message: "Repair request details fetched successfully",
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