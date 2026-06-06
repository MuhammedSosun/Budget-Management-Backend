import { NextFunction, Request, Response } from "express";
import { CurrencyCode } from "../../models/transaction.model";
import { AnalyticsRepository } from "../analytics/analytics.repository";
import { AIReviewService } from "./ai-review.service";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import {
    AIReviewLanguage,
    AIReviewProvider,
} from "./ai-review.types";

const analyticsRepository = new AnalyticsRepository();

const aiReviewService = new AIReviewService(analyticsRepository);

const getRequestLanguage = (value: unknown): AIReviewLanguage => {
    if (value === "en" || value === "tr") {
        return value;
    }

    return "tr";
};

const getSuccessMessage = (language: AIReviewLanguage) => {
    if (language === "en") {
        return "Monthly AI financial analysis report generated.";
    }

    return "Aylık AI finansal analiz raporu oluşturuldu.";
};

export const generateMonthlyAIReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;

        const month = req.body.month as string | undefined;
        const currency = (req.body.currency as CurrencyCode) || "TRY";
        const provider = req.body.provider as AIReviewProvider | undefined;
        const language = getRequestLanguage(req.body.language);

        const allowedProviders: AIReviewProvider[] = ["ollama", "gemini"];

        if (provider && !allowedProviders.includes(provider)) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 400);
        }

        const result = await aiReviewService.generateMonthlyReview({
            workspaceId,
            month,
            currency,
            provider,
            language,
        });

        return res.status(200).json({
            message: getSuccessMessage(language),
            data: result,
        });
    } catch (error) {
        next(error);
    }
};