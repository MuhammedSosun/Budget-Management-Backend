import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/token";
import { AppError } from "../../exceptions/AppError";
import { ErrorMessages } from "../../exceptions/errorMessages";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  let token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    throw new AppError(ErrorMessages.TOKEN_NOT_FOUND, 401);
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw new AppError(ErrorMessages.INVALID_OR_EXPIRED_TOKEN, 401);
  }

  req.user = decoded;
  next();
};
