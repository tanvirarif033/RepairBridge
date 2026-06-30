import prisma from "../../config/prisma";
import { PaymentStatus, PaymentMethod, QuotationStatus, RequestStatus } from "@prisma/client";

interface CreatePaymentInput {
  quotationId: number;
  amount: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

interface UpdatePaymentInput {
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
}

export const createPayment = async (data: CreatePaymentInput) => {
  // Check if quotation exists
  const quotation = await prisma.quotation.findUnique({
    where: { id: data.quotationId },
    include: {
      repairRequest: true,
    },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  // Check if quotation is accepted
  if (quotation.status !== QuotationStatus.ACCEPTED) {
    throw new Error("Only accepted quotations can have payments");
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { quotationId: data.quotationId },
  });

  if (existingPayment) {
    throw new Error("Payment already exists for this quotation");
  }

  // Validate amount (should not exceed estimated cost)
  if (data.amount > Number(quotation.estimatedCost)) {
    throw new Error("Payment amount cannot exceed estimated cost");
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      quotationId: data.quotationId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      paymentStatus: PaymentStatus.PENDING,
    },
    include: {
      quotation: {
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
      },
    },
  });

  return payment;
};

export const getPaymentById = async (paymentId: number) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      quotation: {
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
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const getPaymentByQuotation = async (quotationId: number) => {
  const payment = await prisma.payment.findUnique({
    where: { quotationId },
    include: {
      quotation: {
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
      },
    },
  });

  return payment;
};

export const getCustomerPayments = async (userId: number) => {
  const payments = await prisma.payment.findMany({
    where: {
      quotation: {
        repairRequest: {
          userId,
        },
      },
    },
    include: {
      quotation: {
        include: {
          repairRequest: {
            include: {
              selectedServiceCenters: true,
            },
          },
          serviceCenter: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

export const getAllPayments = async (
  page: number = 1,
  limit: number = 10,
  status?: PaymentStatus
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.paymentStatus = status;
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      quotation: {
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
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.payment.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: payments,
  };
};

export const updatePayment = async (
  paymentId: number,
  data: UpdatePaymentInput
) => {
  // FIXED: Include quotation relation when fetching payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      quotation: true, // Include quotation to access repairRequestId
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // If payment is already completed, don't allow updates
  if (payment.paymentStatus === PaymentStatus.PAID) {
    throw new Error("Completed payments cannot be updated");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      transactionId: data.transactionId,
    },
    include: {
      quotation: {
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
      },
    },
  });

  // If payment is completed, update repair request status
  // FIXED: Access repairRequestId through quotation relation
  if (data.paymentStatus === PaymentStatus.PAID) {
    await prisma.repairRequest.update({
      where: { id: payment.quotation.repairRequestId },
      data: {
        status: RequestStatus.REPAIR_IN_PROGRESS,
      },
    });
  }

  return updatedPayment;
};

export const verifyPayment = async (
  paymentId: number,
  transactionId: string
) => {
  // FIXED: Include quotation relation when fetching payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      quotation: true, // Include quotation to access repairRequestId
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // In a real application, you would verify the transaction with the payment gateway
  // For now, we'll just update the status

  const verifiedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      transactionId,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      quotation: {
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
      },
    },
  });

  // Update repair request status
  // FIXED: Access repairRequestId through quotation relation
  await prisma.repairRequest.update({
    where: { id: payment.quotation.repairRequestId },
    data: {
      status: RequestStatus.REPAIR_IN_PROGRESS,
    },
  });

  return verifiedPayment;
};

export const refundPayment = async (paymentId: number) => {
  // FIXED: Include quotation relation when fetching payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      quotation: true, // Include quotation to access repairRequestId
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.paymentStatus !== PaymentStatus.PAID) {
    throw new Error("Only completed payments can be refunded");
  }

  const refundedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      paymentStatus: PaymentStatus.REFUNDED,
    },
    include: {
      quotation: {
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
      },
    },
  });

  // Update repair request status
  await prisma.repairRequest.update({
    where: { id: payment.quotation.repairRequestId },
    data: {
      status: RequestStatus.CANCELLED,
    },
  });

  return refundedPayment;
};

export const getPaymentStatistics = async () => {
  const [totalPayments, totalAmount, pendingPayments, paidPayments, partialPayments] =
    await prisma.$transaction([
      prisma.payment.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
      }),
      prisma.payment.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      prisma.payment.count({
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      prisma.payment.count({
        where: { paymentStatus: PaymentStatus.PARTIAL },
      }),
    ]);

  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      quotation: {
        include: {
          repairRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    totalPayments,
    totalAmount: totalAmount._sum.amount || 0,
    pendingPayments,
    paidPayments,
    partialPayments,
    recentPayments,
  };
};