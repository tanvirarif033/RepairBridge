import prisma from "../../config/prisma";
import { QuotationStatus, RequestStatus } from "@prisma/client";

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
    include: {
      selectedServiceCenters: true,
    },
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
    data: {
      status: RequestStatus.QUOTATION_SENT,
    },
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

  
  if (
    quotation.status !== QuotationStatus.PENDING &&
    quotation.status !== QuotationStatus.RESCHEDULE_REQUESTED
  ) {
    throw new Error("Only pending or reschedule requested quotations can be updated");
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
    },
  });

  
  if (data.status === QuotationStatus.ACCEPTED) {
    await prisma.repairRequest.update({
      where: { id: quotation.repairRequestId },
      data: {
        status: RequestStatus.APPOINTMENT_CONFIRMED,
      },
    });
  }

  return updatedQuotation;
};


export const customerActionOnQuotation = async (
  quotationId: number,
  action: "ACCEPT" | "REJECT" | "RESCHEDULE" | "ANOTHER_SERVICE_CENTER"
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
      });
      repairRequestStatus = RequestStatus.APPOINTMENT_CONFIRMED;
      break;

    case "REJECT":
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.REJECTED,
        },
      });
      repairRequestStatus = RequestStatus.REJECTED;
      break;

    case "RESCHEDULE":
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.RESCHEDULE_REQUESTED,
        },
      });
      repairRequestStatus = RequestStatus.WAITING_CUSTOMER_RESPONSE;
      break;

    case "ANOTHER_SERVICE_CENTER": // FIXED: Removed space
      updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: QuotationStatus.ANOTHER_SERVICE_CENTER_REQUESTED,
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