import { IBaseRepository } from "../../repository/IBaseRepository";
import { CurrencyCode, ITransaction } from "../../models/transaction.model";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
  findAllByWorkspaceId(
    workspaceId: string,
    limit: number,
    offset: number,
    filters: {
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      filter?: "newest" | "oldest" | "7days" | "30days";
    },
  ): Promise<{ transactions: ITransaction[]; totalCount: number }>;

  findByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
  ): Promise<ITransaction | null>;

  totalIncome(
    workspaceId: string,
    currency: CurrencyCode,
  ): Promise<number>;

  totalExpense(
    workspaceId: string,
    currency: CurrencyCode,
  ): Promise<number>;

  getCategoryStats(
    workspaceId: string,
    currency: CurrencyCode,
  ): Promise<{ name: string; value: number }[]>;

  getTrendStats(
    workspaceId: string,
    period: "weekly" | "monthly",
    currency: CurrencyCode,
  ): Promise<{ name: string; value: number }[]>;

  getMonthlyExpenseTotalByCategory(params: {
    workspaceId: string;
    category: string;
    currency: CurrencyCode;
    startDate: Date;
    endDate: Date;
  }): Promise<number>;

  getMonthlyExpenseTotalsByCategories(params: {
    workspaceId: string;
    categories: string[];
    currency: CurrencyCode;
    startDate: Date;
    endDate: Date;
  }): Promise<Record<string, number>>;

  updateByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
    data: Partial<ITransaction>,
  ): Promise<ITransaction | null>;

  deleteByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
  ): Promise<ITransaction | null>;

  deleteManyByWorkspaceId(workspaceId: string): Promise<void>;
}