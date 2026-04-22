import { Types } from "mongoose";
import { TransactionRequest } from "./transaction.types";
import { AppError } from "../../exceptions/AppError";
import { ErrorMessages } from "../../exceptions/errorMessages";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionService {

    constructor(private readonly transactionRepository: ITransactionRepository) { }

    async createTransaction(transactionData: TransactionRequest) {
        const transaction = await this.transactionRepository.create({
            ...transactionData,
            userId: new Types.ObjectId(transactionData.userId)
        });

        return transaction;
    }

    async findAllByUserId(userId: string, limit: number, offset: number, query: any) {
        const transactions = await this.transactionRepository.findAllByUserId(userId, limit, offset, query);
        if (!transactions) {
            throw new AppError(ErrorMessages.TRANSACTION_NOT_FOUND, 404)
        }
        return transactions;
    }
    async deleteTransaction(id: string, userId: string) {
        await this.findTransactionById(id);
        return this.transactionRepository.delete(id);
    }
    async updateTransaction(id: string, transactionData: TransactionRequest) {
        await this.findTransactionById(id);
        return this.transactionRepository.update(id,
            {
                ...transactionData,
                userId: new Types.ObjectId(transactionData.userId)
            });
    }
    async findTransactionById(id: string) {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) {
            throw new AppError(ErrorMessages.TRANSACTION_NOT_FOUND, 404)
        }
        return transaction;
    }
    async totalExpense(userId: string) {
        return this.transactionRepository.totalExpense(userId);
    }
    async totalIncome(userId: string) {
        return this.transactionRepository.totalIncome(userId);
    }
    async getCategoryStats(userId: string) {
        return this.transactionRepository.getCategoryStats(userId);
    }
    async getTrendStats(userId: string, period: "weekly" | "monthly" = 'weekly') {
        return this.transactionRepository.getTrendStats(userId, period);
    }



}