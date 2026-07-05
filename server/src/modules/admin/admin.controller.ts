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
  getRequestById,
  getAllQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  createAppointment,
  cancelAppointment,
  adminUpdateQuotation,
  updateQuotationServiceCenter,
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

export const getRequestByIdController = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const result = await getRequestById(requestId);

    res.status(200).json({
      success: true,
      message: "Request details fetched successfully",
      data: result,
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

export const changeUserRoleController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

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

export const toggleUserStatusController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

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

// ==================== QUOTATIONS CONTROLLERS ====================
export const getAllQuotationsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await getAllQuotations(page, limit, search, status);

    res.status(200).json({
      success: true,
      message: "Quotations fetched successfully",
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

export const getQuotationByIdController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const result = await getQuotationById(quotationId);

    res.status(200).json({
      success: true,
      message: "Quotation details fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createQuotationController = async (req: Request, res: Response) => {
  try {
    const result = await createQuotation(req.body);

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQuotationController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const result = await updateQuotation(quotationId, req.body);

    res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteQuotationController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const result = await deleteQuotation(quotationId);

    res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin update quotation with customer response
export const adminUpdateQuotationController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const result = await adminUpdateQuotation(quotationId, req.body);

    res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== APPOINTMENTS CONTROLLERS ====================
export const getAllAppointmentsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await getAllAppointments(page, limit, search, status);

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
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

export const getAppointmentByIdController = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.id);
    const result = await getAppointmentById(appointmentId);

    res.status(200).json({
      success: true,
      message: "Appointment details fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAppointmentStatusController = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.id);
    const { status } = req.body;

    const result = await updateAppointmentStatus(appointmentId, status);

    res.status(200).json({
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAppointmentController = async (req: Request, res: Response) => {
  try {
    const result = await createAppointment(req.body);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelAppointmentController = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.id);
    const result = await cancelAppointment(appointmentId);

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Make sure this function is at the end of the file and exported
export const updateQuotationServiceCenterController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const { serviceCenterId, notes } = req.body;

    if (!serviceCenterId) {
      return res.status(400).json({
        success: false,
        message: "Service center ID is required",
      });
    }

    const result = await updateQuotationServiceCenter(quotationId, serviceCenterId, notes);

    res.status(200).json({
      success: true,
      message: "Service center updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
