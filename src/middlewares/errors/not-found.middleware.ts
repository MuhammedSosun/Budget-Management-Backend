import { NextFunction, Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";
import { ErrorMessages } from "../../exceptions/errorMessages";

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next(new AppError(ErrorMessages.NOT_FOUND, 404))
}