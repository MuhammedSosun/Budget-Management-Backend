import { CurrencyCode } from "../../models/transaction.model";

export type AIReviewProvider = "ollama" | "gemini";
export type AIReviewLanguage = "tr" | "en";

export interface CreateMonthlyAIReviewParams {
    workspaceId: string;
    month?: string;
    currency: CurrencyCode;
    provider?: AIReviewProvider;
    language?: AIReviewLanguage;
}

export interface AIReviewResult {
    summary: string;
    highlights: string[];
    risks: string[];
    recommendations: string[];
    savingSuggestion: string;
}

export interface MonthlyAIReviewResult {
    month: string;
    currency: CurrencyCode;
    review: AIReviewResult;
    generatedAt: string;
    provider: string;
    model: string;
}

export interface AIReviewTopCategoryMetric {
    category: string;
    totalExpense: number;
    currency: CurrencyCode;
    percentageOfTotalExpense: number;
    transactionCount: number;
}

export interface AIReviewMemberSpendingMetric {
    userId: string;
    displayName: string;
    email: string;
    totalExpense: number;
    currency: CurrencyCode;
    percentageOfWorkspaceExpense: number;
    transactionCount: number;
    rank: number;
}

export interface AIReviewPreviousMonthMetrics {
    hasPreviousMonthData: boolean;
    incomeDifference: number;
    incomeChangePercentage: number | null;
    expenseDifference: number;
    expenseChangePercentage: number | null;
    netBalanceDifference: number;
    netBalanceChangePercentage: number | null;
}

export interface AIReviewCalculatedMetrics {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    incomeCount: number;
    expenseCount: number;
    savingRatePercentage: number | null;
    topExpenseCategory?: AIReviewTopCategoryMetric;
    memberSpending: AIReviewMemberSpendingMetric[];
    topSpender?: AIReviewMemberSpendingMetric;
    secondTopSpender?: AIReviewMemberSpendingMetric;
    topSpenderDifferenceAmount?: number;
    topSpenderDifferencePercentage?: number | null;
    previousMonth: AIReviewPreviousMonthMetrics;
}

export interface AIReviewSignals {
    month: string;
    currency: CurrencyCode;
    language: AIReviewLanguage;

    financialPosition:
    | "positive_balance"
    | "negative_balance"
    | "balanced"
    | "no_data";

    topExpenseCategory?: string;

    expenseConcentration:
    | "high"
    | "normal"
    | "low"
    | "no_expense_data";

    memberSpendingStatus:
    | "single_member_activity"
    | "multiple_member_activity"
    | "no_member_activity";

    previousMonthComparison:
    | "available"
    | "not_available";

    calculatedMetrics: AIReviewCalculatedMetrics;

    insights: string[];
}