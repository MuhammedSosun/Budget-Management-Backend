import { Types } from "mongoose";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { IBudgetLimitRepository } from "./budget-limit.repository.interface";
import {
  CreateBudgetLimitParams,
  DeleteBudgetLimitParams,
  UpdateBudgetLimitParams,
} from "./budget-limit.types";
import { normalizeCategory } from "../../utils/normalizeCategory";
export class BudgetLimitService {
  constructor(private readonly budgetLimitRepository: IBudgetLimitRepository) {}

  async createBudgetLimit({
    workspaceId,
    createdBy,
    data,
  }: CreateBudgetLimitParams) {
    const normalizedCategory = normalizeCategory(data.category);

    const existingBudgetLimit =
      await this.budgetLimitRepository.findByCategoryAndWorkspaceId(
        workspaceId.toString(),
        normalizedCategory,
        data.period,
      );

    if (existingBudgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_ALREADY_EXISTS, 409);
    }

    try {
      const budgetLimit = await this.budgetLimitRepository.create({
        workspaceId,
        createdBy,
        category: normalizedCategory,
        limit: data.limit,
        period: data.period,
      } as any);

      if (!budgetLimit) {
        throw new AppError(ErrorCode.BUDGET_LIMIT_CREATE_FAILED, 500);
      }

      return budgetLimit;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new AppError(ErrorCode.BUDGET_LIMIT_ALREADY_EXISTS, 409);
      }

      throw error;
    }
  }

  async getBudgetLimitsByWorkspaceId(workspaceId: Types.ObjectId) {
    return this.budgetLimitRepository.findByWorkspaceId(workspaceId.toString());
  }

  async getBudgetLimitById(workspaceId: Types.ObjectId, budgetLimitId: string) {
    const budgetLimit = await this.budgetLimitRepository.findByIdAndWorkspaceId(
      budgetLimitId,
      workspaceId.toString(),
    );

    if (!budgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_NOT_FOUND, 404);
    }

    return budgetLimit;
  }

  async updateBudgetLimit({
    workspaceId,
    budgetLimitId,
    data,
  }: UpdateBudgetLimitParams) {
    const currentBudgetLimit =
      await this.budgetLimitRepository.findByIdAndWorkspaceId(
        budgetLimitId,
        workspaceId.toString(),
      );

    if (!currentBudgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_NOT_FOUND, 404);
    }

    const normalizedCategory = data.category
      ? normalizeCategory(data.category)
      : undefined;

    const nextCategory = normalizedCategory ?? currentBudgetLimit.category;
    const nextPeriod = data.period ?? currentBudgetLimit.period;

    const duplicateBudgetLimit =
      await this.budgetLimitRepository.findByCategoryAndWorkspaceId(
        workspaceId.toString(),
        nextCategory,
        nextPeriod,
      );

    if (
      duplicateBudgetLimit &&
      duplicateBudgetLimit._id.toString() !== budgetLimitId
    ) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_ALREADY_EXISTS, 409);
    }

    const updateData = {
      ...data,
      ...(normalizedCategory && { category: normalizedCategory }),
    };

    const updatedBudgetLimit =
      await this.budgetLimitRepository.updateByIdAndWorkspaceId(
        budgetLimitId,
        workspaceId.toString(),
        updateData,
      );

    if (!updatedBudgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_UPDATE_FAILED, 500);
    }

    return updatedBudgetLimit;
  }

  async deleteBudgetLimit({
    workspaceId,
    budgetLimitId,
  }: DeleteBudgetLimitParams) {
    const deletedBudgetLimit =
      await this.budgetLimitRepository.deleteByIdAndWorkspaceId(
        budgetLimitId,
        workspaceId.toString(),
      );

    if (!deletedBudgetLimit) {
      throw new AppError(ErrorCode.BUDGET_LIMIT_NOT_FOUND, 404);
    }

    return deletedBudgetLimit;
  }

  async deleteBudgetLimitsByWorkspaceId(workspaceId: string) {
    await this.budgetLimitRepository.deleteManyByWorkspaceId(workspaceId);
  }
}
