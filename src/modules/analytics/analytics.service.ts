import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { CurrencyCode } from "../../models/transaction.model";
import { IAnalyticsRepository } from "./analytics.repository.interface";

export class AnalyticsService {
    constructor(private readonly analyticsRepository: IAnalyticsRepository) { }

    private validateCurrency(currency: CurrencyCode) {
        const allowedCurrencies: CurrencyCode[] = ["TRY", "USD", "EUR"];

        if (!allowedCurrencies.includes(currency)) {
            throw new AppError(ErrorCode.INVALID_TRANSACTION_CURRENCY, 400);
        }
    }

    async getMonthlySummary({
        workspaceId,
        month,
        currency,
    }: {
        workspaceId: string;
        month?: string;
        currency: CurrencyCode;
    }) {
        this.validateCurrency(currency);

        return this.analyticsRepository.getMonthlySummary({
            workspaceId,
            month,
            currency,
        });
    }
    async getMemberSpending({
        workspaceId,
        month,
        currency,
    }: {
        workspaceId: string;
        month?: string;
        currency: CurrencyCode;
    }) {
        this.validateCurrency(currency);

        return this.analyticsRepository.getMemberSpending({
            workspaceId,
            month,
            currency,
        });
    }
    async getCategoryBreakdown({
        workspaceId,
        month,
        currency,
    }: {
        workspaceId: string;
        month?: string;
        currency: CurrencyCode;
    }) {
        this.validateCurrency(currency);

        return this.analyticsRepository.getCategoryBreakdown({
            workspaceId,
            month,
            currency,
        });
    }
    async getMonthComparison({
        workspaceId,
        month,
        currency,
    }: {
        workspaceId: string;
        month?: string;
        currency: CurrencyCode;
    }) {
        this.validateCurrency(currency);

        return this.analyticsRepository.getMonthComparison({
            workspaceId,
            month,
            currency,
        });
    }
    async getMonthlyReport({
        workspaceId,
        month,
        currency,
    }: {
        workspaceId: string;
        month?: string;
        currency: CurrencyCode;
    }) {
        this.validateCurrency(currency);

        return this.analyticsRepository.getMonthlyReport({
            workspaceId,
            month,
            currency,
        });
    }
}
