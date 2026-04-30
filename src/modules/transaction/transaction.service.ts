import { Types } from "mongoose";
import { TransactionRequest } from "./transaction.types";
import { AppError } from "../../exceptions/AppError";
import { ErrorMessages } from "../../exceptions/errorMessages";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionService {
  private readonly rates = {
    USD_TRY: 32.2,
    EUR_TRY: 34.96,
  };

  constructor(private readonly transactionRepository: ITransactionRepository) {}
  private calculateConversions(input_details: {
    amount: number;
    currency: string;
  }) {
    const { amount, currency } = input_details;
    let amountInTRY = 0;

    if (currency === "TRY") amountInTRY = amount;
    else if (currency === "USD") amountInTRY = amount * this.rates.USD_TRY;
    else if (currency === "EUR") amountInTRY = amount * this.rates.EUR_TRY;

    return {
      TRY: Number(amountInTRY.toFixed(2)),
      USD: Number((amountInTRY / this.rates.USD_TRY).toFixed(2)),
      EUR: Number((amountInTRY / this.rates.EUR_TRY).toFixed(2)),
    };
  }
  async createTransaction(transactionData: TransactionRequest) {
    const conversions = this.calculateConversions(
      transactionData.input_details,
    );

    const transaction = await this.transactionRepository.create({
      ...transactionData,
      conversions,
      userId: new Types.ObjectId(transactionData.userId),
    });

    return transaction;
  }

  async findAllByUserId(
    userId: string,
    limit: number,
    offset: number,
    query: {
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const transactions = await this.transactionRepository.findAllByUserId(
      userId,
      limit,
      offset,
      query,
    );
    if (!transactions) {
      throw new AppError(ErrorMessages.TRANSACTION_NOT_FOUND, 404);
    }
    return transactions;
  }
  async deleteTransaction(id: string) {
    await this.findTransactionById(id);
    return this.transactionRepository.delete(id);
  }
  async updateTransaction(id: string, transactionData: TransactionRequest) {
    await this.findTransactionById(id);
    const conversions = this.calculateConversions(
      transactionData.input_details,
    );

    return this.transactionRepository.update(id, {
      ...transactionData,
      conversions,
      userId: new Types.ObjectId(transactionData.userId),
    });
  }
  async findTransactionById(id: string) {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new AppError(ErrorMessages.TRANSACTION_NOT_FOUND, 404);
    }
    return transaction;
  }
  async totalExpense(userId: string, currency: "TRY" | "USD" | "EUR") {
    return this.transactionRepository.totalExpense(userId, currency);
  }
  async totalIncome(userId: string, currency: "TRY" | "USD" | "EUR") {
    return this.transactionRepository.totalIncome(userId, currency);
  }
  async getCategoryStats(userId: string, currency: "TRY" | "USD" | "EUR") {
    return this.transactionRepository.getCategoryStats(userId, currency);
  }
  async getTrendStats(
    userId: string,
    period: "weekly" | "monthly" = "weekly",
    currency: "TRY" | "USD" | "EUR" = "TRY",
  ) {
    return this.transactionRepository.getTrendStats(userId, period, currency);
  }
}
