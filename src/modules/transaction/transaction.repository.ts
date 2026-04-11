import Transaction, { ITransaction } from "../../models/transaction.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository extends BaseRepository<ITransaction> implements ITransactionRepository {
    constructor() {
        super(Transaction);
    }

    async findAllByUserId(userId: string): Promise<ITransaction[]> {
        return await this.model.find({ userId }).exec();
    }
}