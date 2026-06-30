import prisma from "../../config/prisma";
import { RequestStatus } from "@prisma/client";

interface CreateReviewInput {
  userId: number;
  repairRequestId: number;
  rating: number;
  comment?: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export const createReview = async (data: CreateReviewInput) => {
  // Check if repair request exists
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id: data.repairRequestId },
    include: {
      user: true,
    },
  });

  if (!repairRequest) {
    throw new Error("Repair request not found");
  }

  // Check if user owns this repair request
  if (repairRequest.userId !== data.userId) {
    throw new Error("You are not authorized to review this repair request");
  }

  // Check if repair request is completed
  if (repairRequest.status !== RequestStatus.COMPLETED) {
    throw new Error("Only completed repair requests can be reviewed");
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { repairRequestId: data.repairRequestId },
  });

  if (existingReview) {
    throw new Error("Review already exists for this repair request");
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId: data.userId,
      repairRequestId: data.repairRequestId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      repairRequest: {
        include: {
          selectedServiceCenters: true,
          images: true,
        },
      },
    },
  });

  return review;
};

export const getReviewById = async (reviewId: number) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      repairRequest: {
        include: {
          selectedServiceCenters: true,
          images: true,
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
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const getReviewByRepairRequest = async (repairRequestId: number) => {
  const review = await prisma.review.findUnique({
    where: { repairRequestId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      repairRequest: {
        include: {
          selectedServiceCenters: true,
          images: true,
        },
      },
    },
  });

  return review;
};

export const getUserReviews = async (userId: number) => {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      repairRequest: {
        include: {
          selectedServiceCenters: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

export const getAllReviews = async (
  page: number = 1,
  limit: number = 10,
  rating?: number
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (rating) {
    where.rating = rating;
  }

  const reviews = await prisma.review.findMany({
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
      repairRequest: {
        include: {
          selectedServiceCenters: true,
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
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.review.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

export const updateReview = async (
  reviewId: number,
  userId: number,
  data: UpdateReviewInput
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Check if user owns this review
  if (review.userId !== userId) {
    throw new Error("You are not authorized to update this review");
  }

  // Validate rating if provided
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      repairRequest: {
        include: {
          selectedServiceCenters: true,
          images: true,
        },
      },
    },
  });

  return updatedReview;
};

export const deleteReview = async (reviewId: number, userId?: number) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // If userId is provided, check if user owns this review
  if (userId && review.userId !== userId) {
    throw new Error("You are not authorized to delete this review");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: "Review deleted successfully" };
};

export const getReviewStatistics = async () => {
  const [totalReviews, averageRating, ratingDistribution] = await prisma.$transaction([
    prisma.review.count(),
    prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    }),
    prisma.$queryRaw`
      SELECT 
        rating,
        COUNT(*) as count
      FROM Review
      GROUP BY rating
      ORDER BY rating DESC
    `,
  ]);

  const recentReviews = await prisma.review.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      repairRequest: {
        select: {
          id: true,
          brand: true,
          model: true,
          selectedServiceCenters: {
            select: {
              name: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  return {
    totalReviews,
    averageRating: averageRating._avg.rating || 0,
    ratingDistribution,
    recentReviews,
  };
};

// FIXED: Completely rewritten getServiceCenterRatings function using SQL query
export const getServiceCenterRatings = async () => {
  // Use raw SQL to get all service centers with their review ratings
  const serviceCentersWithRatings = await prisma.$queryRaw`
    SELECT 
      ssc.id,
      ssc.name,
      ssc.address,
      ssc.phone,
      ssc.rating as googleRating,
      COUNT(r.id) as totalReviews,
      COALESCE(AVG(r.rating), 0) as averageRating
    FROM SelectedServiceCenter ssc
    LEFT JOIN RepairRequest rr ON rr.id = ssc.repairRequestId
    LEFT JOIN Review r ON r.repairRequestId = rr.id
    GROUP BY ssc.id, ssc.name, ssc.address, ssc.phone, ssc.rating
    ORDER BY averageRating DESC
  `;

  // Format the response
  return (serviceCentersWithRatings as any[]).map((center) => ({
    id: center.id,
    name: center.name,
    address: center.address,
    phone: center.phone,
    googleRating: center.googleRating ? Number(center.googleRating) : null,
    averageRating: Number(Number(center.averageRating).toFixed(1)),
    totalReviews: Number(center.totalReviews),
  }));
};