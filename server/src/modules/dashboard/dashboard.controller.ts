import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { getDashboardStats, getRecentActivities as getRecentActivitiesService } from "./dashboard.service";

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    
    const result = await getDashboardStats(userId);

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    
    const result = await getRecentActivitiesService(userId);

    res.status(200).json({
      success: true,
      message: "Recent activities fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};