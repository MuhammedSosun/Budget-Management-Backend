import Transaction, { ITransaction } from "../../models/transaction.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository extends BaseRepository<ITransaction> implements ITransactionRepository {
    constructor() {
        super(Transaction);
    }

    async findAllByUserId(userId: string, limit: number, offset: number, filters: any): Promise<{ transactions: ITransaction[], totalCount: number }> {
        const query: any = { userId };
        if (filters.type) query.type = filters.type;
        if (filters.category) query.category = filters.category;

        const [transactions, totalCount] = await Promise.all([
            this.model.find(query)
                .limit(limit)
                .skip(offset)
                .sort({ date: -1 }),
            this.model.countDocuments(query)
        ]);

        return { transactions, totalCount };
    }

    async totalIncome(userId: string): Promise<number> {
        const transactions = await this.model.find({ userId, type: 'income' }).exec();
        let total = 0;
        for (let i = 0; i < transactions.length; i++) {
            total += transactions[i].amount;
        }
        return total;
    }

    async totalExpense(userId: string): Promise<number> {
        const transactions = await this.model.find({ userId, type: 'expense' }).select('amount').exec();
        return transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }
}