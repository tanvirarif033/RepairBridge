import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createReview,
  getReviewById,
  getReviewByRepairRequest,
  getUserReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewStatistics,
  getServiceCenterRatings,
} from "./review.service";

export const createReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const { repairRequestId, rating, comment } = req.body;

    if (!repairRequestId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Repair request ID and rating are required",
      });
    }

    const result = await createReview({
      userId,
      repairRequestId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReviewController = async (req: Request, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const result = await getReviewById(reviewId);

    res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReviewByRepairRequestController = async (req: Request, res: Response) => {
  try {
    const repairRequestId = Number(req.params.repairRequestId);
    const result = await getReviewByRepairRequest(repairRequestId);

    res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReviewsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const result = await getUserReviews(userId);

    res.status(200).json({
      success: true,
      message: "Your reviews fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllReviewsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const rating = req.query.rating ? Number(req.query.rating) : undefined;

    const result = await getAllReviews(page, limit, rating);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const userId = Number(req.user?.id);
    const { rating, comment } = req.body;

    const result = await updateReview(reviewId, userId, {
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteReviewController = async (req: AuthRequest, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const userId = Number(req.user?.id);
    const role = req.user?.role;

    // Admin can delete any review, user can only delete their own
    const result = await deleteReview(reviewId, role === "ADMIN" ? undefined : userId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReviewStatisticsController = async (req: Request, res: Response) => {
  try {
    const result = await getReviewStatistics();

    res.status(200).json({
      success: true,
      message: "Review statistics fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServiceCenterRatingsController = async (req: Request, res: Response) => {
  try {
    const result = await getServiceCenterRatings();

    res.status(200).json({
      success: true,
      message: "Service center ratings fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};