import prisma from "../../config/prisma";
import { RequestStatus } from "@prisma/client";

export const getDashboardStats = async (userId: number) => {
  // Get all repair request counts
  const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, 
    cancelledRequests, completedRequests] = await prisma.$transaction([
    prisma.repairRequest.count({
      where: { userId }
    }),
    prisma.repairRequest.count({
      where: { userId, status: RequestStatus.PENDING }
    }),
    prisma.repairRequest.count({
      where: { userId, status: RequestStatus.APPROVED }
    }),
    prisma.repairRequest.count({
      where: { userId, status: RequestStatus.REJECTED }
    }),
    prisma.repairRequest.count({
      where: { userId, status: RequestStatus.CANCELLED }
    }),
    prisma.repairRequest.count({
      where: { userId, status: RequestStatus.COMPLETED }
    }),
  ]);

  // Get total payments count
  const totalPayments = await prisma.payment.count({
    where: {
      quotation: {
        repairRequest: {
          userId
        }
      }
    }
  });

  // Calculate total spent (sum of all paid amounts)
  const totalSpentResult = await prisma.payment.aggregate({
    where: {
      quotation: {
        repairRequest: {
          userId
        }
      },
      paymentStatus: 'PAID'
    },
    _sum: {
      amount: true
    }
  });

  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
    completedRequests,
    totalPayments,
    totalSpent: Number(totalSpentResult._sum.amount) || 0
  };
};

export const getRecentActivities = async (userId: number) => {
  // Get recent repair requests
  const recentRequests = await prisma.repairRequest.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Format as activities
  return recentRequests.map(request => ({
    id: request.id,
    title: request.title || `Repair Request #${request.id}`,
    status: request.status,
    date: request.createdAt.toISOString(),
    type: 'request' as const
  }));
};