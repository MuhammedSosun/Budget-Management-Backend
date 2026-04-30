import { Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";

export const errorHandler = (err: Error, _req: Request, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
};
