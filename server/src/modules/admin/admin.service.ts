import prisma from "../../config/prisma";
import { Prisma, RequestStatus } from "@prisma/client";

export const getAllRepairRequests = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: RequestStatus
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.RepairRequestWhereInput = {};

  // Status Filter
  if (status) {
    where.status = status;
  }

  // Search
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { brand: { contains: search } },
      { model: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ];
  }

  const [requests, total] = await prisma.$transaction([
    prisma.repairRequest.findMany({
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.repairRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const approveRepairRequest = async (requestId: number) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: requestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.PENDING) {
    throw new Error("Only pending requests can be approved");
  }

  return await prisma.repairRequest.update({
    where: { id: requestId },
    data: { status: RequestStatus.APPROVED },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

export const rejectRepairRequest = async (requestId: number) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: requestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.PENDING) {
    throw new Error("Only pending requests can be rejected");
  }

  return await prisma.repairRequest.update({
    where: { id: requestId },
    data: { status: RequestStatus.REJECTED },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

export const cancelRepairRequestByAdmin = async (requestId: number) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: requestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (
    repairRequest.status !== RequestStatus.PENDING &&
    repairRequest.status !== RequestStatus.APPROVED
  ) {
    throw new Error("Only pending or approved repair requests can be cancelled");
  }

  return await prisma.repairRequest.update({
    where: { id: requestId },
    data: { status: RequestStatus.CANCELLED },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
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
    prisma.repairRequest.count({ where: { status: RequestStatus.PENDING } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.APPROVED } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.REJECTED } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.CANCELLED } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.QUOTATION_SENT } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.APPOINTMENT_CONFIRMED } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.REPAIR_IN_PROGRESS } }),
    prisma.repairRequest.count({ where: { status: RequestStatus.COMPLETED } }),
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

export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: string
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (role && role !== 'all') {
    where.role = role as any;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        image: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// NEW: Change user role
export const changeUserRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

// NEW: Toggle user status
export const toggleUserStatus = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};