import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject, ZodIssue } from "zod";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { ErrorMessages } from "../../exceptions/errorMessages";

export const validate = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          code: ErrorCode.VALIDATION_ERROR,
          message: ErrorMessages[ErrorCode.VALIDATION_ERROR],
          statusCode: 400,
          errors: error.issues.map((err: ZodIssue) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};
