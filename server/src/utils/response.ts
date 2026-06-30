import { Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  data: any,
  message = "Success",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (
  res: Response,
  message = "Something went wrong",
  statusCode = 400,
  error?: any
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error }),
  });
};

export const sendPaginationResponse = (
  res: Response,
  data: any[],
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  },
  message = "Data fetched successfully"
) => {
  res.status(200).json({
    success: true,
    message,
    meta,
    data,
  });
};