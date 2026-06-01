import { NextFunction, Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new AppError(
      ErrorCode.NOT_FOUND,
      404,
      `${req.originalUrl} route not found.`,
    ),
  );
};
