import prisma from "../../config/prisma";

import { Prisma, RequestStatus } from "@prisma/client";
export const getAllRepairRequests = async (
  page: number,
  limit: number,
  search?: string,
  status?: RequestStatus
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.RepairRequestWhereInput = {};


  if (status) {
    where.status = status;
  }

  
  if (search) {
    where.OR = [
      {
        brand: {
          contains: search,
        },
      },
      {
        model: {
          contains: search,
        },
      },
      {
        user: {
          name: {
            contains: search,
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
          },
        },
      },
    ];
  }

  const requests = await prisma.repairRequest.findMany({
    where,

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

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.repairRequest.count({
    where,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: requests,
  };
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