import { Types } from "mongoose";
import { TransactionRepository } from "./transaction.repository";
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

    async findAllByUserId(userId: string) {
        const transactions = this.transactionRepository.findAllByUserId(userId);
        if (!transactions) {
            throw new AppError(ErrorMessages.TRANSACTION_NOT_FOUND, 404)
        }
        return transactions;
    }
    async deleteTransaction(id: string, userId: string) {
        this.findTransactionById(id);
        return this.transactionRepository.delete(id);
    }
    async updateTransaction(id: string, transactionData: TransactionRequest) {
        this.findTransactionById(id);
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


}