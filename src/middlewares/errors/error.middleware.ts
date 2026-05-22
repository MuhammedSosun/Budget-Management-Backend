import { NextFunction, Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { ErrorMessages } from "../../exceptions/errorMessages";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  return res.status(500).json({
    success: false,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: ErrorMessages[ErrorCode.INTERNAL_SERVER_ERROR],
    statusCode: 500,
  });
};