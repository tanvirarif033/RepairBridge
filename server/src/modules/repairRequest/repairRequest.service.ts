import prisma from "../../config/prisma";
import { RequestStatus, Prisma } from "@prisma/client";

export const createRepairRequest = async (
  userId: number,
  payload: {
    brand: string;
    model: string;
    repairCategory: any;
    title: string;
    description: string;
    customerLatitude: number;
    customerLongitude: number;
    customerAddress: string;
    serviceCenter: {
      googlePlaceId: string;
      name: string;
      address: string;
      phone?: string;
      rating?: number;
      latitude: number;
      longitude: number;
    };
  }
) => {
  const repairRequest = await prisma.repairRequest.create({
    data: {
      userId,
      brand: payload.brand,
      model: payload.model,
      repairCategory: payload.repairCategory,
      title: payload.title,
      description: payload.description,
      customerLatitude: payload.customerLatitude,
      customerLongitude: payload.customerLongitude,
      customerAddress: payload.customerAddress,
      selectedServiceCenters: {
        create: {
          googlePlaceId: payload.serviceCenter.googlePlaceId,
          name: payload.serviceCenter.name,
          address: payload.serviceCenter.address,
          phone: payload.serviceCenter.phone,
          rating: payload.serviceCenter.rating,
          latitude: payload.serviceCenter.latitude,
          longitude: payload.serviceCenter.longitude,
        },
      },
    },
    include: {
      selectedServiceCenters: true,
    },
  });

  return repairRequest;
};

export const getMyRepairRequests = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = ''
) => {
  const skip = (page - 1) * limit;

 
  const where: Prisma.RepairRequestWhereInput = {
    userId,
  };

  if (status && status !== 'all' && status !== 'undefined') {
    where.status = status as RequestStatus;
  }

  
  if (search && search.trim()) {
    where.OR = [
      {
        title: {
          contains: search.trim(),
        },
      },
      {
        brand: {
          contains: search.trim(),
        },
      },
      {
        model: {
          contains: search.trim(),
        },
      },
      {
        description: {
          contains: search.trim(),
        },
      },
    ];
  }

  
  const total = await prisma.repairRequest.count({ where });

 
  const requests = await prisma.repairRequest.findMany({
    where,
    include: {
      selectedServiceCenters: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

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

export const getSingleRepairRequest = async (
  userId: number,
  requestId: number
) => {
  const repairRequest = await prisma.repairRequest.findFirst({
    where: {
      id: requestId,
      userId,
    },
    include: {
      images: true,
      selectedServiceCenters: true,
      quotations: true,
      appointment: true,
      review: true,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  return repairRequest;
};

export const updateRepairRequest = async (
  userId: number,
  requestId: number,
  payload: {
    brand?: string;
    model?: string;
    repairCategory?: any;
    title?: string;
    description?: string;
    customerLatitude?: number;
    customerLongitude?: number;
    customerAddress?: string;
  }
) => {
  const repairRequest = await prisma.repairRequest.findFirst({
    where: {
      id: requestId,
      userId,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== "PENDING") {
    throw new Error("Only pending repair requests can be updated");
  }

  const updatedRequest = await prisma.repairRequest.update({
    where: {
      id: requestId,
    },
    data: {
      brand: payload.brand,
      model: payload.model,
      repairCategory: payload.repairCategory,
      title: payload.title,
      description: payload.description,
      customerLatitude: payload.customerLatitude,
      customerLongitude: payload.customerLongitude,
      customerAddress: payload.customerAddress,
    },
    include: {
      selectedServiceCenters: true,
    },
  });

  return updatedRequest;
};

export const cancelRepairRequest = async (
  userId: number,
  requestId: number
) => {
  const repairRequest = await prisma.repairRequest.findFirst({
    where: {
      id: requestId,
      userId,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.PENDING) {
    throw new Error("Only pending repair requests can be cancelled");
  }

  const cancelledRequest = await prisma.repairRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.CANCELLED,
    },
  });

  return cancelledRequest;
};