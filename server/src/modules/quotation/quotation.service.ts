import prisma from "../../config/prisma";
import { QuotationStatus, RequestStatus, AppointmentStatus } from "@prisma/client";

interface CreateQuotationInput {
  repairRequestId: number;
  serviceCenterId: number;
  estimatedCost: number;
  estimatedRepairDays: number;
  warranty?: string;
  appointmentDate: Date;
  notes?: string;
}

interface UpdateQuotationInput {
  estimatedCost?: number;
  estimatedRepairDays?: number;
  warranty?: string;
  appointmentDate?: Date;
  notes?: string;
  status?: QuotationStatus;
}

export const createQuotation = async (data: CreateQuotationInput) => {
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: data.repairRequestId },
    include: { selectedServiceCenters: true },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  if (repairRequest.status !== RequestStatus.APPROVED) {
    throw new Error("Repair request must be approved to create quotation");
  }

  const serviceCenter = await prisma.selectedServiceCenter.findFirst({
    where: {
      id: data.serviceCenterId,
      repairRequestId: data.repairRequestId,
    },
  });

  if (!serviceCenter) {
    throw new Error("Service center not found for this repair request");
  }

  const existingQuotation = await prisma.quotation.findFirst({
    where: {
      repairRequestId: data.repairRequestId,
      status: {
        in: [QuotationStatus.PENDING, QuotationStatus.ACCEPTED],
      },
    },
  });

  if (existingQuotation) {
    throw new Error("An active quotation already exists for this repair request");
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
      status: QuotationStatus.PENDING,
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
    },
  });

  await prisma.repairRequest.update({
    where: { id: data.repairRequestId },
    data: { status: RequestStatus.QUOTATION_SENT },
  });

  return quotation;
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
          images: true,
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

export const getQuotationsByRepairRequest = async (repairRequestId: number) => {
  const quotations = await prisma.quotation.findMany({
    where: { repairRequestId },
    include: {
      serviceCenter: true,
      appointment: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return quotations;
};

export const getCustomerQuotations = async (userId: number) => {
  const quotations = await prisma.quotation.findMany({
    where: {
      repairRequest: {
        userId,
      },
    },
    include: {
      repairRequest: {
        include: {
          selectedServiceCenters: true,
        },
      },
      serviceCenter: true,
      appointment: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return quotations;
};

export const updateQuotation = async (
  quotationId: number,
  data: UpdateQuotationInput
) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  const updatedQuotation = await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      estimatedCost: data.estimatedCost,
      estimatedRepairDays: data.estimatedRepairDays,
      warranty: data.warranty,
      appointmentDate: data.appointmentDate,
      notes: data.notes,
      status: data.status,
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
      appointment: true,
    },
  });

  if (data.status === QuotationStatus.ACCEPTED) {
    await handleAppointmentCreation(quotationId, updatedQuotation);
  }

  return updatedQuotation;
};

// Update customerActionOnQuotation function
export const customerActionOnQuotation = async (
  quotationId: number,
  action: "ACCEPT" | "REJECT" | "RESCHEDULE" | "ANOTHER_SERVICE_CENTER",
  rescheduleData?: { newDate?: Date; notes?: string }
) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      repairRequest: true,
    },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  if (quotation.status !== QuotationStatus.PENDING) {
    throw new Error("Only pending quotations can be acted upon");
  }

  let updatedQuotation;
  let repairRequestStatus: RequestStatus;

  switch (action) {
    case "ACCEPT":
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.ACCEPTED,
        },
        include: {
          repairRequest: true,
          serviceCenter: true,
        },
      });
      repairRequestStatus = RequestStatus.APPOINTMENT_CONFIRMED;
      
      // Create/Update appointment
      await handleAppointmentCreation(quotationId, updatedQuotation);
      break;

    case "REJECT":
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.REJECTED,
        },
        include: {
          repairRequest: true,
          serviceCenter: true,
        },
      });
      repairRequestStatus = RequestStatus.REJECTED;
      break;

    case "RESCHEDULE":
      const rescheduleNotes = rescheduleData?.newDate 
        ? `RESCHEDULE_REQUEST: ${new Date(rescheduleData.newDate).toISOString()} | Customer requested reschedule to: ${new Date(rescheduleData.newDate).toLocaleString()}. ${rescheduleData?.notes || ''}`
        : `RESCHEDULE_REQUEST: Customer requested reschedule. ${rescheduleData?.notes || ''}`;
      
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.RESCHEDULE_REQUESTED,
          notes: rescheduleNotes,
        },
        include: {
          repairRequest: true,
          serviceCenter: true,
        },
      });
      repairRequestStatus = RequestStatus.WAITING_CUSTOMER_RESPONSE;
      break;

    case "ANOTHER_SERVICE_CENTER":
      const anotherCenterNotes = rescheduleData?.notes 
        ? `ANOTHER_CENTER_REQUEST: ${rescheduleData.notes}`
        : `ANOTHER_CENTER_REQUEST: Customer requested another service center.`;
      
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.ANOTHER_SERVICE_CENTER_REQUESTED,
          notes: anotherCenterNotes,
        },
        include: {
          repairRequest: true,
          serviceCenter: true,
        },
      });
      repairRequestStatus = RequestStatus.WAITING_CUSTOMER_RESPONSE;
      break;

    default:
      throw new Error("Invalid action");
  }

  await prisma.repairRequest.update({
    where: { id: quotation.repairRequestId },
    data: {
      status: repairRequestStatus,
    },
  });

  return updatedQuotation;
};

// Helper: Handle appointment creation/update - UPDATED
const handleAppointmentCreation = async (quotationId: number, quotation: any) => {
  const existingAppointment = await prisma.appointment.findFirst({
    where: { quotationId },
  });

  if (existingAppointment) {
    // Update existing appointment
    await prisma.appointment.update({
      where: { id: existingAppointment.id },
      data: {
        appointmentDate: quotation.appointmentDate,
        status: AppointmentStatus.CONFIRMED,
      },
    });
  } else {
    // Create new appointment
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


export const adminUpdateQuotation = async (
  quotationId: number,
  data: {
    estimatedCost?: number;
    estimatedRepairDays?: number;
    warranty?: string;
    appointmentDate?: Date;
    notes?: string;
    status?: QuotationStatus;
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

  if (data.status === QuotationStatus.ACCEPTED) {
    await handleAppointmentCreation(quotationId, updatedQuotation);
    await prisma.repairRequest.update({
      where: { id: quotation.repairRequestId },
      data: { status: RequestStatus.APPOINTMENT_CONFIRMED },
    });
  }

  return updatedQuotation;
};


export const updateQuotationServiceCenter = async (
  quotationId: number,
  serviceCenterId: number,
  notes?: string
) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  const serviceCenter = await prisma.selectedServiceCenter.findUnique({
    where: { id: serviceCenterId },
  });

  if (!serviceCenter) {
    throw new Error("Service center not found");
  }

  const updatedQuotation = await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      serviceCenterId: serviceCenterId,
      notes: notes || quotation.notes,
      status: QuotationStatus.PENDING, 
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
      appointment: true,
    },
  });

  await prisma.repairRequest.update({
    where: { id: quotation.repairRequestId },
    data: { status: RequestStatus.QUOTATION_SENT },
  });

  return updatedQuotation;
};