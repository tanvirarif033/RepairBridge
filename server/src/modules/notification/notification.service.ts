import prisma from "../../config/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}

interface UpdateNotificationInput {
  isRead?: boolean;
}

export const createNotification = async (data: CreateNotificationInput) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return notification;
};

export const getNotificationById = async (notificationId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

export const getUserNotifications = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
  isRead?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.notification.count({ where });

  // Get unread count
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      unreadCount,
    },
    data: notifications,
  };
};

export const markAsRead = async (notificationId: number, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  // Check if notification belongs to user
  if (notification.userId !== userId) {
    throw new Error("You are not authorized to update this notification");
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedNotification;
};

export const markAllAsRead = async (userId: number) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    message: `${result.count} notifications marked as read`,
    count: result.count,
  };
};

export const deleteNotification = async (notificationId: number, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  // Check if notification belongs to user
  if (notification.userId !== userId) {
    throw new Error("You are not authorized to delete this notification");
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { message: "Notification deleted successfully" };
};

export const deleteAllNotifications = async (userId: number) => {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return {
    message: `${result.count} notifications deleted`,
    count: result.count,
  };
};

export const getUnreadCount = async (userId: number) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return { unreadCount: count };
};

// Helper functions to create notifications for specific events
export const createRequestSubmittedNotification = async (userId: number, requestId: number) => {
  return await createNotification({
    userId,
    title: "Repair Request Submitted",
    message: `Your repair request #${requestId} has been submitted successfully. We will review it shortly.`,
    type: NotificationType.REQUEST,
  });
};

export const createRequestApprovedNotification = async (userId: number, requestId: number) => {
  return await createNotification({
    userId,
    title: "Repair Request Approved",
    message: `Your repair request #${requestId} has been approved. An admin will contact you with a quotation soon.`,
    type: NotificationType.REQUEST,
  });
};

export const createRequestRejectedNotification = async (userId: number, requestId: number) => {
  return await createNotification({
    userId,
    title: "Repair Request Rejected",
    message: `Your repair request #${requestId} has been rejected. Please contact support for more information.`,
    type: NotificationType.REQUEST,
  });
};

export const createQuotationReceivedNotification = async (userId: number, quotationId: number) => {
  return await createNotification({
    userId,
    title: "New Quotation Received",
    message: `You have received a new quotation #${quotationId}. Please review and take action.`,
    type: NotificationType.QUOTATION,
  });
};

export const createQuotationAcceptedNotification = async (userId: number, quotationId: number) => {
  return await createNotification({
    userId,
    title: "Quotation Accepted",
    message: `Your quotation #${quotationId} has been accepted. Your appointment will be confirmed soon.`,
    type: NotificationType.QUOTATION,
  });
};

export const createAppointmentConfirmedNotification = async (userId: number, appointmentId: number) => {
  return await createNotification({
    userId,
    title: "Appointment Confirmed",
    message: `Your appointment #${appointmentId} has been confirmed. Please check the details.`,
    type: NotificationType.APPOINTMENT,
  });
};

export const createPaymentReceivedNotification = async (userId: number, paymentId: number) => {
  return await createNotification({
    userId,
    title: "Payment Received",
    message: `Your payment #${paymentId} has been received successfully.`,
    type: NotificationType.PAYMENT,
  });
};

export const createRepairCompletedNotification = async (userId: number, requestId: number) => {
  return await createNotification({
    userId,
    title: "Repair Completed",
    message: `Your repair request #${requestId} has been completed. Please leave a review.`,
    type: NotificationType.REQUEST,
  });
};

export const createReviewReceivedNotification = async (userId: number, reviewId: number) => {
  return await createNotification({
    userId,
    title: "New Review Received",
    message: `You have received a new review #${reviewId}. Thank you for your feedback!`,
    type: NotificationType.REVIEW,
  });
};

export const createRescheduleRequestNotification = async (userId: number, quotationId: number) => {
  return await createNotification({
    userId,
    title: "Reschedule Requested",
    message: `A reschedule has been requested for quotation #${quotationId}. Please review and respond.`,
    type: NotificationType.QUOTATION,
  });
};

export const createAnotherServiceCenterRequestNotification = async (userId: number, quotationId: number) => {
  return await createNotification({
    userId,
    title: "Another Service Center Requested",
    message: `A request for another service center has been made for quotation #${quotationId}. Please review.`,
    type: NotificationType.QUOTATION,
  });
};