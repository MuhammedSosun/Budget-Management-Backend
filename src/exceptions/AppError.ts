import { ErrorCode } from "./ErrorCodes";
import { ErrorMessages } from "./errorMessages";

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public isOperational: boolean;

  constructor(code: ErrorCode, statusCode: number = 500, message?: string) {
    super(message || ErrorMessages[code]);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}