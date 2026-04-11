import { Types } from "mongoose";

export interface TransactionRequest {

    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
    description?: string;
    userId: string;
}