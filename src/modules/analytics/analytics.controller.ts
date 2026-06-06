import { NextFunction, Request, Response } from "express";
import { CurrencyCode } from "../../models/transaction.model";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";

const analyticsRepository = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);

export const getMonthlySummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const month = req.query.month as string | undefined;
        const currency = (req.query.currency as CurrencyCode) || "TRY";

        const result = await analyticsService.getMonthlySummary({
            workspaceId,
            month,
            currency,
        });

        return res.status(200).json({
            message: "Aylık finans özeti getirildi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMemberSpending = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const month = req.query.month as string | undefined;
        const currency = (req.query.currency as CurrencyCode) || "TRY";

        const result = await analyticsService.getMemberSpending({
            workspaceId,
            month,
            currency,
        });

        return res.status(200).json({
            message: "Üye bazlı harcama analizi getirildi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
export const getCategoryBreakdown = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const month = req.query.month as string | undefined;
        const currency = (req.query.currency as CurrencyCode) || "TRY";

        const result = await analyticsService.getCategoryBreakdown({
            workspaceId,
            month,
            currency,
        });

        return res.status(200).json({
            message: "Kategori bazlı harcama analizi getirildi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthComparison = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const month = req.query.month as string | undefined;
        const currency = (req.query.currency as CurrencyCode) || "TRY";

        const result = await analyticsService.getMonthComparison({
            workspaceId,
            month,
            currency,
        });

        return res.status(200).json({
            message: "Ay bazlı finansal karşılaştırma getirildi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
export const getMonthlyReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const month = req.query.month as string | undefined;
        const currency = (req.query.currency as CurrencyCode) || "TRY";

        const result = await analyticsService.getMonthlyReport({
            workspaceId,
            month,
            currency,
        });

        return res.status(200).json({
            message: "Aylık finansal analiz raporu getirildi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};