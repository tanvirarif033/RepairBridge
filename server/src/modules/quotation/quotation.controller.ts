import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createQuotation,
  getQuotationById,
  getQuotationsByRepairRequest,
  updateQuotation,
  customerActionOnQuotation,
  getCustomerQuotations,
  adminUpdateQuotation,
} from "./quotation.service";

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

export const getQuotationController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.id);
    const result = await getQuotationById(quotationId);

    res.status(200).json({
      success: true,
      message: "Quotation fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQuotationsByRepairRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const repairRequestId = Number(req.params.repairRequestId);
    const result = await getQuotationsByRepairRequest(repairRequestId);

    res.status(200).json({
      success: true,
      message: "Quotations fetched successfully",
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

// Customer action on quotation - UPDATED with reschedule support
export const customerQuotationActionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const quotationId = Number(req.params.id);
    const { action, newDate, notes } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required (ACCEPT, REJECT, RESCHEDULE, ANOTHER_SERVICE_CENTER)",
      });
    }

   
    const quotation = await getQuotationById(quotationId);
    
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }
    
    
    if (Number(quotation.repairRequest.userId) !== Number(req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    
    const result = await customerActionOnQuotation(
      quotationId, 
      action,
      action === 'RESCHEDULE' ? { newDate: newDate ? new Date(newDate) : undefined, notes } : undefined
    );

    res.status(200).json({
      success: true,
      message: `Quotation ${action.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyQuotationsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await getCustomerQuotations(Number(userId));

    res.status(200).json({
      success: true,
      message: "Your quotations fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Update quotation with customer response
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