import { Types } from "mongoose";
import BudgetLimitModel, {
    IBudgetLimit,
} from "../../models/budget-limit.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { IBudgetLimitRepository } from "./budget-limit.repository.interface";
import {
    CreateBudgetLimitRequest,
    UpdateBudgetLimitRequest,
} from "./budget-limit.types";
import { normalizeCategory } from "../../utils/normalizeCategory";

export class BudgetLimitRepository
    extends BaseRepository<IBudgetLimit>
    implements IBudgetLimitRepository {
    constructor() {
        super(BudgetLimitModel);
    }

    async create(
        data: CreateBudgetLimitRequest & {
            workspaceId: Types.ObjectId;
            createdBy: Types.ObjectId;
        },
    ): Promise<IBudgetLimit> {
        return this.model.create(data);
    }

    async findByWorkspaceId(workspaceId: string): Promise<IBudgetLimit[]> {
        return this.model
            .find({
                workspaceId: new Types.ObjectId(workspaceId),
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
    ): Promise<IBudgetLimit | null> {
        return this.model
            .findOne({
                _id: new Types.ObjectId(budgetLimitId),
                workspaceId: new Types.ObjectId(workspaceId),
            })
            .exec();
    }

    async findByCategoryAndWorkspaceId(
        workspaceId: string,
        category: string,
        period: string,
    ): Promise<IBudgetLimit | null> {
        return this.model
            .findOne({
                workspaceId: new Types.ObjectId(workspaceId),
                category: normalizeCategory(category),
                period,
            })
            .exec();
    }

    async updateByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
        data: UpdateBudgetLimitRequest,
    ): Promise<IBudgetLimit | null> {
        return this.model
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(budgetLimitId),
                    workspaceId: new Types.ObjectId(workspaceId),
                },
                {
                    $set: data,
                },
                {
                    new: true,
                    runValidators: true,
                },
            )
            .exec();
    }

    async deleteByIdAndWorkspaceId(
        budgetLimitId: string,
        workspaceId: string,
    ): Promise<IBudgetLimit | null> {
        return this.model
            .findOneAndDelete({
                _id: new Types.ObjectId(budgetLimitId),
                workspaceId: new Types.ObjectId(workspaceId),
            })
            .exec();
    }

    async deleteManyByWorkspaceId(workspaceId: string): Promise<void> {
        await this.model
            .deleteMany({
                workspaceId: new Types.ObjectId(workspaceId),
            })
            .exec();
    }
}