import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createPayment,
  getPaymentById,
  getPaymentByQuotation,
  getCustomerPayments,
  getAllPayments,
  updatePayment,
  verifyPayment,
  refundPayment,
  getPaymentStatistics,
} from "./payment.service";
import { PaymentStatus } from "@prisma/client";

export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const result = await createPayment(req.body);

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);
    const result = await getPaymentById(paymentId);

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentByQuotationController = async (req: Request, res: Response) => {
  try {
    const quotationId = Number(req.params.quotationId);
    const result = await getPaymentByQuotation(quotationId);

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPaymentsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await getCustomerPayments(userId);

    res.status(200).json({
      success: true,
      message: "Your payments fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPaymentsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as PaymentStatus | undefined;

    const result = await getAllPayments(page, limit, status);

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);
    const result = await updatePayment(paymentId, req.body);

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const result = await verifyPayment(paymentId, transactionId);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const refundPaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);
    const result = await refundPayment(paymentId);

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentStatisticsController = async (req: Request, res: Response) => {
  try {
    const result = await getPaymentStatistics();

    res.status(200).json({
      success: true,
      message: "Payment statistics fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};