import { CurrencyCode } from "../../models/transaction.model";

export type BudgetUsageStatus = "SAFE" | "WARNING" | "EXCEEDED";

export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

export interface BudgetUsageResult {
  budgetLimitId: string;
  category: string;
  limit: MoneyAmount;
  spent: MoneyAmount;
  remaining: MoneyAmount;
  usagePercentage: number;
  status: BudgetUsageStatus;
}

export interface BudgetSummaryResult {
  totalBudgetLimits: number;
  safeCount: number;
  warningCount: number;
  exceededCount: number;
  totalLimit: MoneyAmount;
  totalSpent: MoneyAmount;
  totalRemaining: MoneyAmount;
  overallUsagePercentage: number;
}

export interface BudgetWarningResult {
  hasWarning: boolean;
  status: BudgetUsageStatus;
  category: string;
  message: string;
  limit: MoneyAmount;
  spentAfterTransaction: MoneyAmount;
  usagePercentage: number;
}
