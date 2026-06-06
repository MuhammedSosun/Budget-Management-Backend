import { CurrencyCode } from "../../models/transaction.model";

export interface MonthlySummaryParams {
    workspaceId: string;
    month?: string;
    currency: CurrencyCode;
}

export interface MonthlySummaryResult {
    month: string;
    currency: CurrencyCode;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    incomeCount: number;
    expenseCount: number;
}
export interface MemberSpendingResult {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    totalExpense: number;
    transactionCount: number;
}
export interface CategoryBreakdownResult {
    category: string;
    totalExpense: number;
    transactionCount: number;
    percentage: number;
}
export interface MonthFinancialSnapshot {
    month: string;
    currency: CurrencyCode;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    incomeCount: number;
    expenseCount: number;
}

export interface MonthComparisonChange {
    incomeDifference: number;
    incomeChangePercentage: number | null;

    expenseDifference: number;
    expenseChangePercentage: number | null;

    netBalanceDifference: number;
    netBalanceChangePercentage: number | null;
}

export interface MonthComparisonResult {
    currentMonth: MonthFinancialSnapshot;
    previousMonth: MonthFinancialSnapshot;
    hasPreviousMonthData: boolean;
    change: MonthComparisonChange;
}
export interface MonthlyReportResult {
    month: string;
    currency: CurrencyCode;
    summary: MonthlySummaryResult;
    memberSpending: MemberSpendingResult[];
    categoryBreakdown: CategoryBreakdownResult[];
    monthComparison: MonthComparisonResult;
}