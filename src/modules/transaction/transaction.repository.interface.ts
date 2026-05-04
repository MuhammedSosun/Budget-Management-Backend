import { IBaseRepository } from "../../repository/IBaseRepository";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
  findAllByUserId(
    userId: string,
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
  totalIncome(userId: string, currency: "TRY" | "USD" | "EUR"): Promise<number>;
  totalExpense(
    userId: string,
    currency: "TRY" | "USD" | "EUR",
  ): Promise<number>;
  getCategoryStats(
    userId: string,
    currency: "TRY" | "USD" | "EUR",
  ): Promise<{ name: string; value: number }[]>;
  getTrendStats(
    userId: string,
    period: "weekly" | "monthly",
    currency: "TRY" | "USD" | "EUR",
  ): Promise<{ name: string; value: number }[]>;
}
