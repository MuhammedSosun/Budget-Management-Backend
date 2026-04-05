import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject, ZodIssue } from "zod";

export const validate = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: "error",
                    errors: error.issues.map((err: ZodIssue) => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};