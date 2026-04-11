import { IBaseRepository } from "../../repository/IBaseRepository";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
    findAllByUserId(userId: string): Promise<ITransaction[]>;
}