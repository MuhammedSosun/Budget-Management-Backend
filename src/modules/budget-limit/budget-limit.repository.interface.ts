import { Types } from "mongoose";
import { IBudgetLimit } from "../../models/budget-limit.model";
import {
    CreateBudgetLimitRequest,
    UpdateBudgetLimitRequest,
} from "./budget-limit.types";
import { IBaseRepository } from "../../repository/IBaseRepository";

export interface IBudgetLimitRepository extends IBaseRepository<IBudgetLimit> {
    create(
        data: CreateBudgetLimitRequest & {
            workspaceId: Types.ObjectId;
            createdBy: Types.ObjectId;
        },
    ): Promise<IBudgetLimit>;

    findByWorkspaceId(workspaceId: string): Promise<IBudgetLimit[]>;

    findByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
    ): Promise<IBudgetLimit | null>;

    findByCategoryAndWorkspaceId(
        workspaceId: string,
        category: string,
        period: string,
    ): Promise<IBudgetLimit | null>;

    updateByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
        data: UpdateBudgetLimitRequest,
    ): Promise<IBudgetLimit | null>;

    deleteByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
    ): Promise<IBudgetLimit | null>;

    deleteManyByWorkspaceId(workspaceId: string): Promise<void>;
}