import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { BudgetLimitRepository } from "./budget-limit.repository";
import { BudgetLimitService } from "./budget-limit.service";
import { TransactionRepository } from "../transaction/transaction.repository";
import { BudgetUsageService } from "./budget-usage.service";
import { CurrencyCode } from "../../models/transaction.model";

const budgetLimitRepository = new BudgetLimitRepository();
const transactionRepository = new TransactionRepository();
const budgetLimitService = new BudgetLimitService(budgetLimitRepository);
const budgetUsageService = new BudgetUsageService(
  budgetLimitRepository,
  transactionRepository,
);

export const createBudgetLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await budgetLimitService.createBudgetLimit({
      workspaceId: new Types.ObjectId(req.params.workspaceId as string),
      createdBy: new Types.ObjectId(req.user.userId),
      data: req.body,
    });

    return res.status(201).json({
      message: "Bütçe limiti başarıyla oluşturuldu.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetLimits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await budgetLimitService.getBudgetLimitsByWorkspaceId(
      new Types.ObjectId(req.params.workspaceId as string),
    );

    return res.status(200).json({
      message: "Bütçe limitleri listelendi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetLimitById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await budgetLimitService.getBudgetLimitById(
      new Types.ObjectId(req.params.workspaceId as string),
      req.params.budgetLimitId as string,
    );

    return res.status(200).json({
      message: "Bütçe limiti bulundu.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBudgetLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await budgetLimitService.updateBudgetLimit({
      workspaceId: new Types.ObjectId(req.params.workspaceId as string),
      budgetLimitId: req.params.budgetLimitId as string,
      data: req.body,
    });

    return res.status(200).json({
      message: "Bütçe limiti başarıyla güncellendi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudgetLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await budgetLimitService.deleteBudgetLimit({
      workspaceId: new Types.ObjectId(req.params.workspaceId as string),
      budgetLimitId: req.params.budgetLimitId as string,
    });

    return res.status(200).json({
      message: "Bütçe limiti başarıyla silindi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getBudgetLimitsUsage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const month = req.query.month as string | undefined;

    const result = await budgetUsageService.getBudgetLimitsUsage({
      workspaceId,
      month,
    });

    return res.status(200).json({
      message: "Bütçe kullanım durumları listelendi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetLimitUsageById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const budgetLimitId = req.params.budgetLimitId as string;
    const month = req.query.month as string | undefined;

    const result = await budgetUsageService.getBudgetLimitUsageById({
      workspaceId,
      budgetLimitId,
      month,
    });

    return res.status(200).json({
      message: "Bütçe kullanım durumu getirildi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetLimitsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const month = req.query.month as string | undefined;
    const currency = (req.query.currency as CurrencyCode) || "TRY";

    const result = await budgetUsageService.getBudgetSummary({
      workspaceId,
      month,
      currency,
    });

    return res.status(200).json({
      message: "Bütçe özeti getirildi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
