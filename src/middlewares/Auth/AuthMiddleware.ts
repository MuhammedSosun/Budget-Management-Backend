import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/token";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    let token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(ErrorCode.TOKEN_NOT_FOUND, 401);
    }

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};