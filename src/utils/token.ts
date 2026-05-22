import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { AppError } from "../exceptions/AppError";
import { ErrorCode } from "../exceptions/ErrorCodes";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "4h",
  });
};

export const generateRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      throw new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED, 401);
    }

    if (err instanceof JsonWebTokenError) {
      throw new AppError(ErrorCode.ACCESS_TOKEN_INVALID, 401);
    }

    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 500);
  }
};

export const verfiyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      throw new AppError(ErrorCode.REFRESH_TOKEN_EXPIRED, 401);
    }

    if (err instanceof JsonWebTokenError) {
      throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID, 401);
    }

    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 500);
  }
};