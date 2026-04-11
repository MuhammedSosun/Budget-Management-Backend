import { NextFunction, Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            statusCode: err.statusCode,

        });

    }
    console.error("Unexpected error", err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        statusCode: 500,
    });
}