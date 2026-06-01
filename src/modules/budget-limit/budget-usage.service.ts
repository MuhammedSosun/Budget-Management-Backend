import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { CurrencyCode } from "../../models/transaction.model";
import { IBudgetLimitRepository } from "./budget-limit.repository.interface";
import { ITransactionRepository } from "../transaction/transaction.repository.interface";
import {
  BudgetSummaryResult,
  BudgetUsageResult,
  BudgetUsageStatus,
  BudgetWarningResult,
} from "./budget-usage.types";
import { normalizeCategory } from "../../utils/normalizeCategory";
export class BudgetUsageService {
  constructor(
    private readonly budgetLimitRepository: IBudgetLimitRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}
  private readonly rates = {
    USD_TRY: 32.2,
    EUR_TRY: 34.96,
  };

  private convertAmount(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
  ): number {
    if (fromCurrency === toCurrency) {
      return this.round(amount);
    }

    let amountInTRY = amount;

    if (fromCurrency === "USD") {
      amountInTRY = amount * this.rates.USD_TRY;
    }

    if (fromCurrency === "EUR") {
      amountInTRY = amount * this.rates.EUR_TRY;
    }

    if (toCurrency === "TRY") {
      return this.round(amountInTRY);
    }

    if (toCurrency === "USD") {
      return this.round(amountInTRY / this.rates.USD_TRY);
    }

    if (toCurrency === "EUR") {
      return this.round(amountInTRY / this.rates.EUR_TRY);
    }

    return this.round(amount);
  }
  private getMonthRange(month?: string) {
    const selectedMonth = month || new Date().toISOString().slice(0, 7);

    const isValidMonth = /^\d{4}-\d{2}$/.test(selectedMonth);

    if (!isValidMonth) {
      throw new AppError(ErrorCode.INVALID_BUDGET_MONTH, 400);
    }

    const [year, monthIndex] = selectedMonth.split("-").map(Number);

    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 1);

    return {
      startDate,
      endDate,
      month: selectedMonth,
    };
  }

  private getStatus(usagePercentage: number): BudgetUsageStatus {
    if (usagePercentage >= 100) {
      return "EXCEEDED";
    }

    if (usagePercentage >= 80) {
      return "WARNING";
    }

    return "SAFE";
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }

  private buildUsageResult(params: {
    budgetLimitId: string;
    category: string;
    limitAmount: number;
    currency: CurrencyCode;
    spentAmount: number;
  }): BudgetUsageResult {
    const { budgetLimitId, category, limitAmount, currency, spentAmount } =
      params;

    const usagePercentage =
      limitAmount > 0 ? this.round((spentAmount / limitAmount) * 100) : 0;

    const remainingAmount = Math.max(limitAmount - spentAmount, 0);

    return {
      budgetLimitId,
      category,
      limit: {
        amount: this.round(limitAmount),
        currency,
      },
      spent: {
        amount: this.round(spentAmount),
        currency,
      },
      remaining: {
        amount: this.round(remainingAmount),
        currency,
      },
      usagePercentage,
      status: this.getStatus(usagePercentage),
    };
  }

  async getBudgetLimitsUsage(params: {
    workspaceId: string;
    month?: string;
  }): Promise<BudgetUsageResult[]> {
    const { workspaceId, month } = params;
    const { startDate, endDate } = this.getMonthRange(month);

    const budgetLimits =
      await this.budgetLimitRepository.findByWorkspaceId(workspaceId);

    const groupedByCurrency = budgetLimits.reduce<
      Record<CurrencyCode, string[]>
    >(
      (acc, budgetLimit) => {
        const currency = budgetLimit.limit.currency;
        acc[currency].push(budgetLimit.category);
        return acc;
      },
      {
        TRY: [],
        USD: [],
        EUR: [],
      },
    );

    const [tryTotals, usdTotals, eurTotals] = await Promise.all([
      this.transactionRepository.getMonthlyExpenseTotalsByCategories({
        workspaceId,
        categories: groupedByCurrency.TRY,
        currency: "TRY",
        startDate,
        endDate,
      }),
      this.transactionRepository.getMonthlyExpenseTotalsByCategories({
        workspaceId,
        categories: groupedByCurrency.USD,
        currency: "USD",
        startDate,
        endDate,
      }),
      this.transactionRepository.getMonthlyExpenseTotalsByCategories({
        workspaceId,
        categories: groupedByCurrency.EUR,
        currency: "EUR",
        startDate,
        endDate,
      }),
    ]);

    const totalsByCurrency: Record<CurrencyCode, Record<string, number>> = {
      TRY: tryTotals,
      USD: usdTotals,
      EUR: eurTotals,
    };

    return budgetLimits.map((budgetLimit) => {
      const currency = budgetLimit.limit.currency;
      const spentAmount = totalsByCurrency[currency][budgetLimit.category] ?? 0;

      return this.buildUsageResult({
        budgetLimitId: budgetLimit._id.toString(),
        category: budgetLimit.category,
        limitAmount: budgetLimit.limit.amount,
        currency,
        spentAmount,
      });
    });
  }

  async getBudgetLimitUsageById(params: {
    workspaceId: string;
    budgetLimitId: string;
    month?: string;
  }): Promise<BudgetUsageResult> {
    const { workspaceId, budgetLimitId, month } = params;
    const { startDate, endDate } = this.getMonthRange(month);

    const budgetLimit = await this.budgetLimitRepository.findByIdAndWorkspaceId(
      budgetLimitId,
      workspaceId,
    );

    if (!budgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_NOT_FOUND, 404);
    }

    const currency = budgetLimit.limit.currency;

    const spentAmount =
      await this.transactionRepository.getMonthlyExpenseTotalByCategory({
        workspaceId,
        category: budgetLimit.category,
        currency,
        startDate,
        endDate,
      });

    return this.buildUsageResult({
      budgetLimitId: budgetLimit._id.toString(),
      category: budgetLimit.category,
      limitAmount: budgetLimit.limit.amount,
      currency,
      spentAmount,
    });
  }

  async getBudgetSummary(params: {
    workspaceId: string;
    month?: string;
    currency?: CurrencyCode;
  }): Promise<BudgetSummaryResult> {
    const { workspaceId, month, currency = "TRY" } = params;
    const { startDate, endDate } = this.getMonthRange(month);

    const budgetLimits =
      await this.budgetLimitRepository.findByWorkspaceId(workspaceId);

    const categories = budgetLimits.map((budgetLimit) => budgetLimit.category);

    const totals =
      await this.transactionRepository.getMonthlyExpenseTotalsByCategories({
        workspaceId,
        categories,
        currency,
        startDate,
        endDate,
      });

    let safeCount = 0;
    let warningCount = 0;
    let exceededCount = 0;
    let totalLimit = 0;
    let totalSpent = 0;

    for (const budgetLimit of budgetLimits) {
      const limitAmount = this.convertAmount(
        budgetLimit.limit.amount,
        budgetLimit.limit.currency,
        currency,
      );

      const spentAmount = totals[budgetLimit.category] ?? 0;

      const usagePercentage =
        limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;

      const status = this.getStatus(usagePercentage);

      if (status === "SAFE") safeCount++;
      if (status === "WARNING") warningCount++;
      if (status === "EXCEEDED") exceededCount++;

      totalLimit += limitAmount;
      totalSpent += spentAmount;
    }

    const totalRemaining = Math.max(totalLimit - totalSpent, 0);

    return {
      totalBudgetLimits: budgetLimits.length,
      safeCount,
      warningCount,
      exceededCount,
      totalLimit: {
        amount: this.round(totalLimit),
        currency,
      },
      totalSpent: {
        amount: this.round(totalSpent),
        currency,
      },
      totalRemaining: {
        amount: this.round(totalRemaining),
        currency,
      },
      overallUsagePercentage:
        totalLimit > 0 ? this.round((totalSpent / totalLimit) * 100) : 0,
    };
  }

  async checkBudgetLimitAfterTransaction(params: {
    workspaceId: string;
    category: string;
    transactionDate: Date;
  }): Promise<BudgetWarningResult | null> {
    const { workspaceId, transactionDate } = params;
    const category = normalizeCategory(params.category);

    const month = transactionDate.toISOString().slice(0, 7);
    const { startDate, endDate } = this.getMonthRange(month);

    const budgetLimit =
      await this.budgetLimitRepository.findByCategoryAndWorkspaceId(
        workspaceId,
        category,
        "monthly",
      );

    if (!budgetLimit) {
      return null;
    }

    const currency = budgetLimit.limit.currency;

    const spentAmount =
      await this.transactionRepository.getMonthlyExpenseTotalByCategory({
        workspaceId,
        category,
        currency,
        startDate,
        endDate,
      });

    const usagePercentage =
      budgetLimit.limit.amount > 0
        ? this.round((spentAmount / budgetLimit.limit.amount) * 100)
        : 0;

    const status = this.getStatus(usagePercentage);

    if (status === "SAFE") {
      return null;
    }

    return {
      hasWarning: true,
      status,
      category,
      message:
        status === "EXCEEDED"
          ? `${category} kategorisi için aylık bütçe limiti aşıldı.`
          : `${category} kategorisi için aylık bütçe limitinin %${usagePercentage}'ine ulaşıldı.`,
      limit: {
        amount: this.round(budgetLimit.limit.amount),
        currency,
      },
      spentAfterTransaction: {
        amount: this.round(spentAmount),
        currency,
      },
      usagePercentage,
    };
  }
}
