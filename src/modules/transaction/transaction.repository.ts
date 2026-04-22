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

        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) query.date.$gte = new Date(filters.startDate as string);
            if (filters.endDate) query.date.$lte = new Date(filters.endDate as string);
        }

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
    async getCategoryStats(userId: string): Promise<{ name: string; value: number }[]> {
        const transactions = await this.model.find({ userId, type: 'expense' }).select('amount category').exec();
        const totals: Record<string, number> = {};

        for (let i = 0; i < transactions.length; i++) {
            const item = transactions[i];
            const category = (item.category || 'Diğer').trim().toLowerCase();
            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
            const amount = item.amount || 0;

            if (totals[formattedCategory]) {
                totals[formattedCategory] += amount;
            } else {
                totals[formattedCategory] = amount;
            }
        }
        return Object.keys(totals).map(category => ({
            name: category,
            value: totals[category]
        }));
    }
    async getTrendStats(userId: string, period: "weekly" | "monthly" = 'weekly') {
        const now = new Date();
        let startDate = new Date();
        let labels: string[] = [];
        if (period === 'weekly') {
            startDate.setDate(now.getDate() - 7);
            labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
        } else {
            startDate.setFullYear(now.getFullYear() - 1);
            labels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        }

        const transactions = await this.model.find({ userId, type: 'expense', date: { $gte: startDate } }).select('amount date').exec();


        const totals: Record<string, number> = {};
        labels.forEach(day => {
            totals[day] = 0;
        });
        for (let i = 0; i < transactions.length; i++) {
            let labelName = "";
            const item = transactions[i];
            if (period === 'weekly') {
                labelName = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(item.date).replace('.', '');
            } else {
                labelName = new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(item.date).replace('.', '');
                labelName = labelName.charAt(0).toUpperCase() + labelName.slice(1);
            }
            const amount = item.amount || 0;
            if (totals.hasOwnProperty(labelName)) {
                totals[labelName] += amount;
            }
        }
        return labels.map(label => ({
            name: label,
            value: totals[label]
        }));
    }
}