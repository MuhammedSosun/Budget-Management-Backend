import { Types } from "mongoose";
import { TransactionRequest } from "./transaction.types";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { ITransactionRepository } from "./transaction.repository.interface";
import { CurrencyCode } from "../../models/transaction.model";

export class TransactionService {
  private readonly rates = {
    USD_TRY: 32.2,
    EUR_TRY: 34.96,
  };

  constructor(private readonly transactionRepository: ITransactionRepository) { }

  private validateCurrency(currency: CurrencyCode) {
    const allowedCurrencies: CurrencyCode[] = ["TRY", "USD", "EUR"];

    if (!allowedCurrencies.includes(currency)) {
      throw new AppError(ErrorCode.INVALID_TRANSACTION_CURRENCY, 400);
    }
  }

  private validateDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime()) {
      throw new AppError(ErrorCode.INVALID_TRANSACTION_DATE_RANGE, 400);
    }
  }

  private calculateConversions(input_details: {
    amount: number;
    currency: CurrencyCode;
  }) {
    const { amount, currency } = input_details;

    this.validateCurrency(currency);

    let amountInTRY = 0;

    if (currency === "TRY") {
      amountInTRY = amount;
    }

    if (currency === "USD") {
      amountInTRY = amount * this.rates.USD_TRY;
    }

    if (currency === "EUR") {
      amountInTRY = amount * this.rates.EUR_TRY;
    }

    return {
      TRY: Number(amountInTRY.toFixed(2)),
      USD: Number((amountInTRY / this.rates.USD_TRY).toFixed(2)),
      EUR: Number((amountInTRY / this.rates.EUR_TRY).toFixed(2)),
    };
  }

  async createTransaction(
    workspaceId: string,
    createdBy: string,
    transactionData: TransactionRequest,
  ) {
    const conversions = this.calculateConversions(
      transactionData.input_details,
    );

    const transaction = await this.transactionRepository.create({
      ...transactionData,
      conversions,
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(createdBy),
    });

    if (!transaction) {
      throw new AppError(ErrorCode.TRANSACTION_CREATE_FAILED, 500);
    }

    return transaction;
  }

  async findAllByWorkspaceId(
    workspaceId: string,
    limit: number,
    offset: number,
    query: {
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      filter?: "newest" | "oldest" | "7days" | "30days";
    },
  ) {
    this.validateDateRange(query.startDate, query.endDate);

    return this.transactionRepository.findAllByWorkspaceId(
      workspaceId,
      limit,
      offset,
      query,
    );
  }

  async updateTransaction(
    id: string,
    workspaceId: string,
    transactionData: TransactionRequest,
  ) {
    const conversions = this.calculateConversions(
      transactionData.input_details,
    );

    const updatedTransaction =
      await this.transactionRepository.updateByIdAndWorkspaceId(
        id,
        workspaceId,
        {
          title: transactionData.title,
          input_details: transactionData.input_details,
          conversions,
          type: transactionData.type,
          category: transactionData.category,
          date: transactionData.date,
          description: transactionData.description,
        },
      );

    if (!updatedTransaction) {
      throw new AppError(ErrorCode.TRANSACTION_NOT_FOUND, 404);
    }

    return updatedTransaction;
  }

  async findTransactionById(id: string, workspaceId: string) {
    const transaction = await this.transactionRepository.findByIdAndWorkspaceId(
      id,
      workspaceId,
    );

    if (!transaction) {
      throw new AppError(ErrorCode.TRANSACTION_NOT_FOUND, 404);
    }

    return transaction;
  }

  async deleteTransaction(id: string, workspaceId: string) {
    const deletedTransaction =
      await this.transactionRepository.deleteByIdAndWorkspaceId(
        id,
        workspaceId,
      );

    if (!deletedTransaction) {
      throw new AppError(ErrorCode.TRANSACTION_NOT_FOUND, 404);
    }

    return deletedTransaction;
  }

  async totalExpense(workspaceId: string, currency: CurrencyCode) {
    this.validateCurrency(currency);

    return this.transactionRepository.totalExpense(workspaceId, currency);
  }

  async totalIncome(workspaceId: string, currency: CurrencyCode) {
    this.validateCurrency(currency);

    return this.transactionRepository.totalIncome(workspaceId, currency);
  }

  async getCategoryStats(workspaceId: string, currency: CurrencyCode) {
    this.validateCurrency(currency);

    return this.transactionRepository.getCategoryStats(workspaceId, currency);
  }

  async getTrendStats(
    workspaceId: string,
    period: "weekly" | "monthly" = "weekly",
    currency: CurrencyCode = "TRY",
  ) {
    this.validateCurrency(currency);

    return this.transactionRepository.getTrendStats(
      workspaceId,
      period,
      currency,
    );
  }

}