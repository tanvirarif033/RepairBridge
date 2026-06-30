import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createAppointment,
  getAppointmentById,
  getAppointmentByRepairRequest,
  getCustomerAppointments,
  updateAppointment,
  cancelAppointment,
  getUpcomingAppointments,
} from "./appointment.service";



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

export const getAppointmentController = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.id);
    const result = await getAppointmentById(appointmentId);

    res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointmentByRepairRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const repairRequestId = Number(req.params.repairRequestId);
    const result = await getAppointmentByRepairRequest(repairRequestId);

    res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAppointmentsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await getCustomerAppointments(userId);

    res.status(200).json({
      success: true,
      message: "Your appointments fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAppointmentController = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.id);
    const result = await updateAppointment(appointmentId, req.body);

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
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

export const getUpcomingAppointmentsController = async (req: Request, res: Response) => {
  try {
    const result = await getUpcomingAppointments();

    res.status(200).json({
      success: true,
      message: "Upcoming appointments fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};