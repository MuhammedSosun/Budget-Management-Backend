import { IBaseRepository } from "../../repository/IBaseRepository";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
    findAllByUserId(userId: string, limit: number, offset: number, filters: any): Promise<{ transactions: ITransaction[], totalCount: number }>;
    totalIncome(userId: string): Promise<number>;
    totalExpense(userId: string): Promise<number>;
}