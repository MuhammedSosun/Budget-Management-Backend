import { NextFunction, Request, Response } from "express";
import { TransactionService } from "./transaction.service";
import { TransactionRepository } from "./transaction.repository";
import getPagination from "../../utils/pageable";
import { publishTransactionEvent } from "./transaction.events";
import { BudgetLimitRepository } from "../budget-limit/budget-limit.repository";
import { BudgetUsageService } from "../budget-limit/budget-usage.service";

const transactionRepo = new TransactionRepository();
const budgetLimitRepository = new BudgetLimitRepository();

const budgetUsageService = new BudgetUsageService(
  budgetLimitRepository,
  transactionRepo,
);

const transactionService = new TransactionService(
  transactionRepo,
  budgetUsageService,
);

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const createdBy = req.user.userId as string;

    const result = await transactionService.createTransaction(
      workspaceId,
      createdBy,
      req.body,
    );

    publishTransactionEvent({
      workspaceId,
      action: "created",
      transaction: result.transaction,
      actor: {
        userId: req.user.userId,
        email: req.user.email,
      },
    });

    res.status(201).json({
      message: "İşlem başarıyla oluşturuldu",
      data: result.transaction,
      budgetWarning: result.budgetWarning,
    });
  } catch (error) {
    next(error);
  }
};

export const findAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paginationParams = {
      page: req.query.page as string,
      size: (req.query.pageSize as string) || (req.query.size as string),
    };
    const { limit, offset, page, size } = getPagination(paginationParams);
    const { transactions, totalCount } =
      await transactionService.findAllByWorkspaceId(
        req.params.workspaceId as string,
        limit,
        offset,
        req.query as {
          type?: string;
          category?: string;
          startDate?: string;
          endDate?: string;
          search?: string;
          filter?: "newest" | "oldest" | "7days" | "30days";
        },
      );
    res.status(200).json({
      message: "İşlemler listelendi",
      data: {
        content: transactions,
        currentPage: page,
        pageSize: size,
        totalElements: totalCount,
        totalPages: Math.ceil(totalCount / size),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactionId = req.params.id as string;
    const workspaceId = req.params.workspaceId as string;

    const result = await transactionService.deleteTransaction(
      transactionId,
      workspaceId,
    );

    publishTransactionEvent({
      workspaceId,
      action: "deleted",
      transactionId,
      actor: {
        userId: req.user.userId,
        email: req.user.email,
      },
    });

    res.status(200).json({
      message: "İşlem silindi",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactionId = req.params.id as string;
    const workspaceId = req.params.workspaceId as string;

    const result = await transactionService.updateTransaction(
      transactionId,
      workspaceId,
      req.body,
    );

    publishTransactionEvent({
      workspaceId,
      action: "updated",
      transaction: result.transaction,
      transactionId,
      actor: {
        userId: req.user.userId,
        email: req.user.email,
      },
    });

    res.status(200).json({
      message: "İşlem güncellendi",
      data: result.transaction,
      budgetWarning: result.budgetWarning,
    });
  } catch (error) {
    next(error);
  }
};

export const findTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const transactionId = req.params.id as string;
    const workspaceId = req.params.workspaceId as string;
    const result = await transactionService.findTransactionById(
      transactionId,
      workspaceId,
    );
    res.status(200).json({
      message: "İşlem bulundu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const totalIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const currency = (req.query.currency as "TRY" | "USD" | "EUR") || "TRY";
    const result = await transactionService.totalIncome(workspaceId, currency);
    res.status(200).json({
      message: "Toplam gelir bulundu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const totalExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const currency = (req.query.currency as "TRY" | "USD" | "EUR") || "TRY";
    const result = await transactionService.totalExpense(workspaceId, currency);
    res.status(200).json({
      message: "Toplam gider bulundu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const currency = (req.query.currency as "TRY" | "USD" | "EUR") || "TRY";
    const result = await transactionService.getCategoryStats(
      workspaceId,
      currency,
    );
    res.status(200).json({
      message: "Kategori istatistikleri bulundu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getTrendStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const period = (req.query.period as "weekly" | "monthly") || "weekly";
    const currency = (req.query.currency as "TRY" | "USD" | "EUR") || "TRY";

    const result = await transactionService.getTrendStats(
      workspaceId,
      period,
      currency,
    );

    res.status(200).json({
      message: "Trend istatistikleri bulundu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
