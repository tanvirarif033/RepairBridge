import prisma from "../../config/prisma";
import { Prisma, RequestStatus, AppointmentStatus } from "@prisma/client";

export const getAllRepairRequests = async (
  page: number = 1,
  limit: number = 10,
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

export const getRequestById = async (requestId: number) => {
  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
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
      quotations: {
        include: {
          serviceCenter: true,
        },
      },
      appointment: true,
      review: true,
    },
  });

  if (!request) {
    throw new Error("Repair request not found");
  }

  return request;
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

//  QUOTATIONS FUNCTIONS 
export const getAllQuotations = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.QuotationWhereInput = {};

  if (status && status !== 'all') {
    where.status = status as any;
  }

  if (search) {
    where.OR = [
      {
        repairRequest: {
          title: { contains: search },
        },
      },
      {
        repairRequest: {
          user: {
            name: { contains: search },
          },
        },
      },
      {
        serviceCenter: {
          name: { contains: search },
        },
      },
    ];
  }

  const [quotations, total] = await prisma.$transaction([
    prisma.quotation.findMany({
      where,
      include: {
        repairRequest: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        serviceCenter: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotation.count({ where }),
  ]);

  return {
    data: quotations,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const getQuotationById = async (quotationId: number) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      repairRequest: {
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
        },
      },
      serviceCenter: true,
      appointment: true,
      payment: true,
    },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  return quotation;
};

export const createQuotation = async (data: {
  repairRequestId: number;
  serviceCenterId: number;
  estimatedCost: number;
  estimatedRepairDays: number;
  warranty?: string;
  appointmentDate: Date;
  notes?: string;
}) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: data.repairRequestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.APPROVED) {
    throw new Error("Only approved repair requests can have quotations");
  }
 
  const quotation = await prisma.quotation.create({
    data: {
      repairRequestId: data.repairRequestId,
      serviceCenterId: data.serviceCenterId,
      estimatedCost: data.estimatedCost,
      estimatedRepairDays: data.estimatedRepairDays,
      warranty: data.warranty,
      appointmentDate: data.appointmentDate,
      notes: data.notes,
      status: "PENDING",
    },
    include: {
      repairRequest: {
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
      },
      serviceCenter: true,
    },
  });

  await prisma.repairRequest.update({
    where: { id: data.repairRequestId },
    data: { status: RequestStatus.QUOTATION_SENT },
  });

  return quotation;
};

export const updateQuotation = async (quotationId: number, data: any) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  return await prisma.quotation.update({
    where: { id: quotationId },
    data,
    include: {
      repairRequest: {
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
      },
      serviceCenter: true,
    },
  });
};

export const deleteQuotation = async (quotationId: number) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  await prisma.quotation.delete({
    where: { id: quotationId },
  });

  return { message: "Quotation deleted successfully" };
};

// ADMIN UPDATE QUOTATION 

export const adminUpdateQuotation = async (
  quotationId: number,
  data: {
    estimatedCost?: number;
    estimatedRepairDays?: number;
    warranty?: string;
    appointmentDate?: Date;
    notes?: string;
    status?: string;
  }
) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  const updateData: any = {
    estimatedCost: data.estimatedCost,
    estimatedRepairDays: data.estimatedRepairDays,
    warranty: data.warranty,
    appointmentDate: data.appointmentDate,
    status: data.status || quotation.status,
  };

  let adminResponse = '';
  
  const currentEstimatedCost = Number(quotation.estimatedCost);
  const currentEstimatedRepairDays = Number(quotation.estimatedRepairDays);
  const currentAppointmentDate = quotation.appointmentDate ? new Date(quotation.appointmentDate) : null;
  const newAppointmentDate = data.appointmentDate ? new Date(data.appointmentDate) : null;

  if (data.status && data.status !== quotation.status) {
    adminResponse += `Changed status to: ${data.status}. `;
  }
  
  if (data.estimatedCost !== undefined && data.estimatedCost !== currentEstimatedCost) {
    adminResponse += `Updated cost to: ${data.estimatedCost}. `;
  }
  
  if (data.estimatedRepairDays !== undefined && data.estimatedRepairDays !== currentEstimatedRepairDays) {
    adminResponse += `Updated repair days to: ${data.estimatedRepairDays}. `;
  }
  
  if (newAppointmentDate && currentAppointmentDate && 
      newAppointmentDate.getTime() !== currentAppointmentDate.getTime()) {
    adminResponse += `Updated appointment to: ${newAppointmentDate.toLocaleString()}. `;
  }

  if (adminResponse) {
    updateData.notes = `Admin updated: ${adminResponse} ${data.notes || quotation.notes || ''}`.trim();
  } else if (data.notes) {
    updateData.notes = data.notes;
  }

  const updatedQuotation = await prisma.quotation.update({
    where: { id: quotationId },
    data: updateData,
    include: {
      repairRequest: {
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
      },
      serviceCenter: true,
      appointment: true,
    },
  });

  // If status is ACCEPTED or RESCHEDULE_REQUESTED, update appointment
  if (data.status === 'ACCEPTED' || data.status === 'RESCHEDULE_REQUESTED') {
    await handleAppointmentUpdate(quotationId, updatedQuotation);
    
    if (data.status === 'ACCEPTED') {
      await prisma.repairRequest.update({
        where: { id: quotation.repairRequestId },
        data: { status: RequestStatus.APPOINTMENT_CONFIRMED },
      });
    }
  }

  return updatedQuotation;
};


const handleAppointmentUpdate = async (quotationId: number, quotation: any) => {
  const existingAppointment = await prisma.appointment.findFirst({
    where: { quotationId },
  });

  if (existingAppointment) {
    await prisma.appointment.update({
      where: { id: existingAppointment.id },
      data: {
        appointmentDate: quotation.appointmentDate,
        status: AppointmentStatus.CONFIRMED,
      },
    });
  } else {
    await prisma.appointment.create({
      data: {
        repairRequestId: quotation.repairRequestId,
        quotationId: quotation.id,
        appointmentDate: quotation.appointmentDate,
        status: AppointmentStatus.CONFIRMED,
      },
    });
  }
};
// APPOINTMENTS FUNCTIONS 
export const getAllAppointments = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.AppointmentWhereInput = {};

  if (status && status !== 'all') {
    where.status = status as any;
  }

  if (search) {
    where.OR = [
      {
        repairRequest: {
          title: { contains: search },
        },
      },
      {
        repairRequest: {
          user: {
            name: { contains: search },
          },
        },
      },
    ];
  }

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      include: {
        repairRequest: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        quotation: {
          include: {
            serviceCenter: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { appointmentDate: "asc" },
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: appointments,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const getAppointmentById = async (appointmentId: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      repairRequest: {
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
        },
      },
      quotation: {
        include: {
          serviceCenter: true,
          payment: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

export const updateAppointmentStatus = async (appointmentId: number, status: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as any },
    include: {
      repairRequest: {
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
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });

  if (status === 'CONFIRMED') {
    await prisma.repairRequest.update({
      where: { id: appointment.repairRequestId },
      data: { status: RequestStatus.APPOINTMENT_CONFIRMED },
    });
  }

  return updatedAppointment;
};

export const createAppointment = async (data: {
  repairRequestId: number;
  quotationId: number;
  appointmentDate: Date;
}) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: data.repairRequestId },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: data.quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  const appointment = await prisma.appointment.create({
    data: {
      repairRequestId: data.repairRequestId,
      quotationId: data.quotationId,
      appointmentDate: data.appointmentDate,
      status: "PENDING",
    },
    include: {
      repairRequest: {
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
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });

  return appointment;
};

export const cancelAppointment = async (appointmentId: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const cancelledAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
    include: {
      repairRequest: {
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
      },
      quotation: {
        include: {
          serviceCenter: true,
        },
      },
    },
  });

  await prisma.repairRequest.update({
    where: { id: appointment.repairRequestId },
    data: { status: RequestStatus.CANCELLED },
  });

  return cancelledAppointment;
};

export const updateQuotationServiceCenter = async (
  quotationId: number,
  serviceCenterId: number,
  notes?: string
) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      repairRequest: {
        include: {
          selectedServiceCenters: true,
        },
      },
    },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  // Verify the service center exists
  let serviceCenter = await prisma.selectedServiceCenter.findUnique({
    where: { id: serviceCenterId },
  });

  if (!serviceCenter) {
    // Try to find in repair request's selected service centers
    const existingCenter = quotation.repairRequest.selectedServiceCenters.find(
      (sc: any) => sc.id === serviceCenterId
    );
    
    if (existingCenter) {
      serviceCenter = existingCenter;
    } else {
      // Use the first available service center
      const firstCenter = quotation.repairRequest.selectedServiceCenters[0];
      if (firstCenter) {
        serviceCenter = firstCenter;
        serviceCenterId = firstCenter.id;
      } else {
        throw new Error("No valid service center available");
      }
    }
  }

  const updatedQuotation = await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      serviceCenterId: serviceCenterId,
      notes: notes || quotation.notes,
      status: "PENDING",
    },
    include: {
      repairRequest: {
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
        },
      },
      serviceCenter: true,
      appointment: true,
    },
  });

  await prisma.repairRequest.update({
    where: { id: quotation.repairRequestId },
    data: { status: "QUOTATION_SENT" },
  });

  return updatedQuotation;
};