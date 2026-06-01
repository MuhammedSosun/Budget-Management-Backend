import { Types } from "mongoose";
import { BudgetPeriod, CurrencyCode } from "../../models/budget-limit.model";

export interface CreateBudgetLimitRequest {
  category: string;
  limit: {
    amount: number;
    currency: CurrencyCode;
  };
  period: BudgetPeriod;
}

export interface UpdateBudgetLimitRequest {
  category?: string;
  limit?: {
    amount: number;
    currency: CurrencyCode;
  };
  period?: BudgetPeriod;
}

export interface CreateBudgetLimitParams {
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  data: CreateBudgetLimitRequest;
}

export interface UpdateBudgetLimitParams {
  workspaceId: Types.ObjectId;
  budgetLimitId: string;
  data: UpdateBudgetLimitRequest;
}

export interface DeleteBudgetLimitParams {
  workspaceId: Types.ObjectId;
  budgetLimitId: string;
}
