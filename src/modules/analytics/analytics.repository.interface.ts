import {
    MonthlySummaryParams,
    MonthlySummaryResult,
    MemberSpendingResult,
    CategoryBreakdownResult,
    MonthComparisonResult,
    MonthlyReportResult,
} from "./analytics.types";

export interface IAnalyticsRepository {
    getMonthlySummary(
        params: MonthlySummaryParams,
    ): Promise<MonthlySummaryResult>;

    getMemberSpending(
        params: MonthlySummaryParams,
    ): Promise<MemberSpendingResult[]>;

    getCategoryBreakdown(
        params: MonthlySummaryParams,
    ): Promise<CategoryBreakdownResult[]>;
    getMonthComparison(
        params: MonthlySummaryParams,
    ): Promise<MonthComparisonResult>;
    getMonthlyReport(
        params: MonthlySummaryParams,
    ): Promise<MonthlyReportResult>;
}