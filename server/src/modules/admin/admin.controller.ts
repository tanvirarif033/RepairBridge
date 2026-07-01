import { Request, Response } from "express";
import { 
  getAllRepairRequests,
  approveRepairRequest,
  rejectRepairRequest,
  cancelRepairRequestByAdmin,
  getDashboardStatistics,
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
} from "./admin.service";
import { RequestStatus } from "@prisma/client";

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as RequestStatus | undefined;

    const result = await getAllRepairRequests(page, limit, search, status);

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

export const approveRequest = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const result = await approveRepairRequest(requestId);

    res.status(200).json({
      success: true,
      message: "Repair request approved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const result = await rejectRepairRequest(requestId);

    res.status(200).json({
      success: true,
      message: "Repair request rejected successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelRequest = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const result = await cancelRepairRequestByAdmin(requestId);

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

export const dashboardStatistics = async (req: Request, res: Response) => {
  try {
    const result = await getDashboardStatistics();

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const result = await getAllUsers(page, limit, search, role);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
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

// NEW: Change user role
export const changeUserRoleController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    // Prevent changing own role
    if ((req as any).user?.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or ADMIN",
      });
    }

    const result = await changeUserRole(userId, role);

    res.status(200).json({
      success: true,
      message: `User role changed to ${role} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: Toggle user status
export const toggleUserStatusController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    // Prevent toggling own status
    if ((req as any).user?.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status",
      });
    }

    const result = await toggleUserStatus(userId);

    res.status(200).json({
      success: true,
      message: `User ${result.isActive ? 'activated' : 'deactivated'} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};