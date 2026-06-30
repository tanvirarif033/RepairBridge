import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  getNotificationById,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification,
} from "./notification.service";

export const createNotificationController = async (req: Request, res: Response) => {
  try {
    const result = await createNotification(req.body);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationController = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = Number(req.params.id);
    const result = await getNotificationById(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyNotificationsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isRead = req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : undefined;

    const result = await getUserNotifications(userId, page, limit, isRead);

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsReadController = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = Number(req.params.id);
    const userId = Number(req.user?.id);

    const result = await markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllAsReadController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotificationController = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = Number(req.params.id);
    const userId = Number(req.user?.id);

    const result = await deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAllNotificationsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCountController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await getUnreadCount(userId);

    res.status(200).json({
      success: true,
      message: "Unread count fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};