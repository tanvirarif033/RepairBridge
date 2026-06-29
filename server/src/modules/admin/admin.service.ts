import prisma from "../../config/prisma";
import { RequestStatus } from "@prisma/client";

export const getAllRepairRequests = async () => {
  const requests = await prisma.repairRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      selectedServiceCenters: true,

      images: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
};



export const approveRepairRequest = async (
  requestId: number
) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.PENDING) {
    throw new Error("Only pending requests can be approved");
  }

  const updatedRequest = await prisma.repairRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.APPROVED,
    },
  });

  return updatedRequest;
};

export const rejectRepairRequest = async (
  requestId: number
) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.PENDING) {
    throw new Error("Only pending requests can be rejected");
  }

  const updatedRequest = await prisma.repairRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.REJECTED,
    },
  });

  return updatedRequest;
};


export const cancelRepairRequestByAdmin = async (
  requestId: number
) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (
    repairRequest.status !== RequestStatus.PENDING &&
    repairRequest.status !== RequestStatus.APPROVED
  ) {
    throw new Error(
      "Only pending or approved repair requests can be cancelled"
    );
  }

  const updatedRequest = await prisma.repairRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.CANCELLED,
    },
  });

  return updatedRequest;
};


export const getDashboardStatistics = async () => {
  const [
    totalUsers,
    totalRepairRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
    quotationSent,
    appointmentConfirmed,
    repairInProgress,
    completedRepairs,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.repairRequest.count(),

    prisma.repairRequest.count({
      where: { status: RequestStatus.PENDING },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.APPROVED },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.REJECTED },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.CANCELLED },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.QUOTATION_SENT },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.APPOINTMENT_CONFIRMED },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.REPAIR_IN_PROGRESS },
    }),

    prisma.repairRequest.count({
      where: { status: RequestStatus.COMPLETED },
    }),
  ]);

  return {
    totalUsers,
    totalRepairRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
    quotationSent,
    appointmentConfirmed,
    repairInProgress,
    completedRepairs,
  };
};