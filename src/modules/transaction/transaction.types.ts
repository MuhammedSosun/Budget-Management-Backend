import {
  CurrencyCode,
  TransactionType,
} from "../../models/transaction.model";

export interface TransactionRequest {
  title: string;
  input_details: {
    amount: number;
    currency: CurrencyCode;
  };
  type: TransactionType;
  category: string;
  date: Date;
  description?: string;
}