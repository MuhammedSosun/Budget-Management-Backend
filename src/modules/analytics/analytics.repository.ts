import { Types } from "mongoose";
import Transaction from "../../models/transaction.model";
import { getMonthRange, getPreviousMonth } from "../../utils/monthRange";
import {
    CategoryBreakdownResult,
    MemberSpendingResult,
    MonthComparisonResult,
    MonthlyReportResult,
    MonthlySummaryParams,
    MonthlySummaryResult,
} from "./analytics.types";
import { IAnalyticsRepository } from "./analytics.repository.interface";

export class AnalyticsRepository implements IAnalyticsRepository {
    async getMonthlySummary({
        workspaceId,
        month,
        currency,
    }: MonthlySummaryParams): Promise<MonthlySummaryResult> {
        const { month: resolvedMonth, startDate, endDate } = getMonthRange(month);

        const [summary] = await Transaction.aggregate([
            {
                $match: {
                    workspaceId: new Types.ObjectId(workspaceId),
                    date: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,

                    totalIncome: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "income"] },
                                `$conversions.${currency}`,
                                0,
                            ],
                        },
                    },

                    totalExpense: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "expense"] },
                                `$conversions.${currency}`,
                                0,
                            ],
                        },
                    },

                    transactionCount: {
                        $sum: 1,
                    },

                    incomeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, 1, 0],
                        },
                    },

                    expenseCount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const totalIncome = Number((summary?.totalIncome ?? 0).toFixed(2));
        const totalExpense = Number((summary?.totalExpense ?? 0).toFixed(2));

        return {
            month: resolvedMonth,
            currency,
            totalIncome,
            totalExpense,
            netBalance: Number((totalIncome - totalExpense).toFixed(2)),
            transactionCount: summary?.transactionCount ?? 0,
            incomeCount: summary?.incomeCount ?? 0,
            expenseCount: summary?.expenseCount ?? 0,
        };
    }
    async getMemberSpending({
        workspaceId,
        month,
        currency,
    }: MonthlySummaryParams): Promise<MemberSpendingResult[]> {
        const { startDate, endDate } = getMonthRange(month);

        const result = await Transaction.aggregate([
            {
                $match: {
                    workspaceId: new Types.ObjectId(workspaceId),
                    type: "expense",
                    date: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: "$createdBy",
                    totalExpense: {
                        $sum: `$conversions.${currency}`,
                    },
                    transactionCount: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: {
                        $toString: "$_id",
                    },
                    firstName: {
                        $ifNull: ["$user.firstName", ""],
                    },
                    lastName: {
                        $ifNull: ["$user.lastName", ""],
                    },
                    email: {
                        $ifNull: ["$user.email", ""],
                    },
                    avatarUrl: {
                        $ifNull: ["$user.avatarUrl", ""],
                    },
                    totalExpense: {
                        $round: ["$totalExpense", 2],
                    },
                    transactionCount: 1,
                },
            },
            {
                $sort: {
                    totalExpense: -1,
                },
            },
        ]);

        return result;
    }
    async getCategoryBreakdown({
        workspaceId,
        month,
        currency,
    }: MonthlySummaryParams): Promise<CategoryBreakdownResult[]> {
        const { startDate, endDate } = getMonthRange(month);

        const result = await Transaction.aggregate([
            {
                $match: {
                    workspaceId: new Types.ObjectId(workspaceId),
                    type: "expense",
                    date: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $toLower: {
                            $trim: {
                                input: "$category",
                            },
                        },
                    },
                    totalExpense: {
                        $sum: `$conversions.${currency}`,
                    },
                    transactionCount: {
                        $sum: 1,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalWorkspaceExpense: {
                        $sum: "$totalExpense",
                    },
                    categories: {
                        $push: {
                            category: "$_id",
                            totalExpense: "$totalExpense",
                            transactionCount: "$transactionCount",
                        },
                    },
                },
            },
            {
                $unwind: "$categories",
            },
            {
                $project: {
                    _id: 0,
                    category: "$categories.category",
                    totalExpense: {
                        $round: ["$categories.totalExpense", 2],
                    },
                    transactionCount: "$categories.transactionCount",
                    percentage: {
                        $cond: [
                            { $eq: ["$totalWorkspaceExpense", 0] },
                            0,
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$categories.totalExpense",
                                                    "$totalWorkspaceExpense",
                                                ],
                                            },
                                            100,
                                        ],
                                    },
                                    2,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $sort: {
                    totalExpense: -1,
                },
            },
        ]);

        return result;
    }
    private calculatePercentageChange(
        current: number,
        previous: number,
        hasPreviousMonthData: boolean,
    ) {
        if (!hasPreviousMonthData) {
            return null;
        }

        if (previous === 0) {
            if (current === 0) return 0;

            return null;
        }

        return Number((((current - previous) / previous) * 100).toFixed(2));
    }

    async getMonthComparison({
        workspaceId,
        month,
        currency,
    }: MonthlySummaryParams): Promise<MonthComparisonResult> {
        const currentSummary = await this.getMonthlySummary({
            workspaceId,
            month,
            currency,
        });

        const previousMonth = getPreviousMonth(currentSummary.month);

        const previousSummary = await this.getMonthlySummary({
            workspaceId,
            month: previousMonth,
            currency,
        });

        const hasPreviousMonthData = previousSummary.transactionCount > 0;

        const incomeDifference = Number(
            (currentSummary.totalIncome - previousSummary.totalIncome).toFixed(2),
        );

        const expenseDifference = Number(
            (currentSummary.totalExpense - previousSummary.totalExpense).toFixed(2),
        );

        const netBalanceDifference = Number(
            (currentSummary.netBalance - previousSummary.netBalance).toFixed(2),
        );

        return {
            currentMonth: currentSummary,
            previousMonth: previousSummary,
            hasPreviousMonthData,
            change: {
                incomeDifference,
                incomeChangePercentage: this.calculatePercentageChange(
                    currentSummary.totalIncome,
                    previousSummary.totalIncome,
                    hasPreviousMonthData,
                ),

                expenseDifference,
                expenseChangePercentage: this.calculatePercentageChange(
                    currentSummary.totalExpense,
                    previousSummary.totalExpense,
                    hasPreviousMonthData,
                ),

                netBalanceDifference,
                netBalanceChangePercentage: this.calculatePercentageChange(
                    currentSummary.netBalance,
                    previousSummary.netBalance,
                    hasPreviousMonthData,
                ),
            },
        };
    }
    async getMonthlyReport({
        workspaceId,
        month,
        currency,
    }: MonthlySummaryParams): Promise<MonthlyReportResult> {
        const summary = await this.getMonthlySummary({
            workspaceId,
            month,
            currency,
        });

        const [memberSpending, categoryBreakdown, monthComparison] =
            await Promise.all([
                this.getMemberSpending({
                    workspaceId,
                    month: summary.month,
                    currency,
                }),
                this.getCategoryBreakdown({
                    workspaceId,
                    month: summary.month,
                    currency,
                }),
                this.getMonthComparison({
                    workspaceId,
                    month: summary.month,
                    currency,
                }),
            ]);

        return {
            month: summary.month,
            currency,
            summary,
            memberSpending,
            categoryBreakdown,
            monthComparison,
        };
    }
}

