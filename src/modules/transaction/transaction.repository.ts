import { Types } from "mongoose";
import Transaction, {
  CurrencyCode,
  ITransaction,
} from "../../models/transaction.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor() {
    super(Transaction);
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  async findAllByWorkspaceId(
    workspaceId: string,
    limit: number,
    offset: number,
    filters: {
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      filter?: "newest" | "oldest" | "7days" | "30days";
    },
  ): Promise<{ transactions: ITransaction[]; totalCount: number }> {
    const query: Record<string, unknown> = {
      workspaceId: this.toObjectId(workspaceId),
    };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const dateFilter: { $gte?: Date; $lte?: Date } = {};

    if (filters.filter === "7days") {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      dateFilter.$gte = date;
    }

    if (filters.filter === "30days") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      dateFilter.$gte = date;
    }

    if (filters.startDate) {
      dateFilter.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      dateFilter.$lte = new Date(filters.endDate);
    }

    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    const sortOption =
      filters.filter === "oldest"
        ? { date: 1 as const }
        : { date: -1 as const };

    const [transactions, totalCount] = await Promise.all([
      this.model
        .find(query)
        .populate("createdBy", "firstName lastName email avatarUrl")
        .limit(limit)
        .skip(offset)
        .sort(sortOption)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      transactions,
      totalCount,
    };
  }

  async findByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
  ): Promise<ITransaction | null> {
    return this.model
      .findOne({
        _id: this.toObjectId(transactionId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .populate("createdBy", "firstName lastName email avatarUrl")
      .exec();
  }

  async updateByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
    data: Partial<ITransaction>,
  ): Promise<ITransaction | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(transactionId),
          workspaceId: this.toObjectId(workspaceId),
        },
        data,
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();
  }

  async deleteByIdAndWorkspaceId(
    transactionId: string,
    workspaceId: string,
  ): Promise<ITransaction | null> {
    return this.model
      .findOneAndDelete({
        _id: this.toObjectId(transactionId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .exec();
  }

  async totalIncome(
    workspaceId: string,
    currency: CurrencyCode = "TRY",
  ): Promise<number> {
    const transactions = await this.model
      .find({
        workspaceId: this.toObjectId(workspaceId),
        type: "income",
      })
      .select("conversions")
      .exec();

    let total = 0;

    for (const transaction of transactions) {
      total += transaction.conversions[currency] || 0;
    }

    return total;
  }

  async totalExpense(
    workspaceId: string,
    currency: CurrencyCode = "TRY",
  ): Promise<number> {
    const transactions = await this.model
      .find({
        workspaceId: this.toObjectId(workspaceId),
        type: "expense",
      })
      .select("conversions")
      .exec();

    let total = 0;

    for (const transaction of transactions) {
      total += transaction.conversions[currency] || 0;
    }

    return total;
  }

  async getCategoryStats(
    workspaceId: string,
    currency: CurrencyCode = "TRY",
  ): Promise<{ name: string; value: number }[]> {
    const transactions = await this.model
      .find({
        workspaceId: this.toObjectId(workspaceId),
        type: "expense",
      })
      .select("conversions category")
      .exec();

    const totals: Record<string, number> = {};

    for (const transaction of transactions) {
      const normalizedCategory = (transaction.category || "Diğer")
        .trim()
        .toLowerCase();

      const formattedCategory =
        normalizedCategory.charAt(0).toUpperCase() +
        normalizedCategory.slice(1);

      const amount = transaction.conversions[currency] || 0;

      totals[formattedCategory] = (totals[formattedCategory] || 0) + amount;
    }

    return Object.keys(totals).map((category) => ({
      name: category,
      value: totals[category],
    }));
  }
  async getMonthlyExpenseTotalByCategory(params: {
    workspaceId: string;
    category: string;
    currency: CurrencyCode;
    startDate: Date;
    endDate: Date;
  }): Promise<number> {
    const { workspaceId, category, currency, startDate, endDate } = params;

    const result = await this.model
      .aggregate<{ total: number }>([
        {
          $match: {
            workspaceId: this.toObjectId(workspaceId),
            type: "expense",
            category,
            date: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: `$conversions.${currency}`,
            },
          },
        },
      ])
      .exec();

    return result[0]?.total ?? 0;
  }

  async getMonthlyExpenseTotalsByCategories(params: {
    workspaceId: string;
    categories: string[];
    currency: CurrencyCode;
    startDate: Date;
    endDate: Date;
  }): Promise<Record<string, number>> {
    const { workspaceId, categories, currency, startDate, endDate } = params;

    if (categories.length === 0) {
      return {};
    }

    const result = await this.model
      .aggregate<{ _id: string; total: number }>([
        {
          $match: {
            workspaceId: this.toObjectId(workspaceId),
            type: "expense",
            category: {
              $in: categories,
            },
            date: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$category",
            total: {
              $sum: `$conversions.${currency}`,
            },
          },
        },
      ])
      .exec();

    return result.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});
  }
  async getTrendStats(
    workspaceId: string,
    period: "weekly" | "monthly" = "weekly",
    currency: CurrencyCode = "TRY",
  ): Promise<{ name: string; value: number }[]> {
    const now = new Date();
    const startDate = new Date();

    const labels =
      period === "weekly"
        ? ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
        : [
            "Oca",
            "Şub",
            "Mar",
            "Nis",
            "May",
            "Haz",
            "Tem",
            "Ağu",
            "Eyl",
            "Eki",
            "Kas",
            "Ara",
          ];

    const totals = labels.map((label) => ({
      name: label,
      value: 0,
    }));

    if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const transactions = await this.model
      .find({
        workspaceId: this.toObjectId(workspaceId),
        type: "expense",
        date: { $gte: startDate },
      })
      .select("conversions date")
      .exec();

    for (const transaction of transactions) {
      const amount = transaction.conversions[currency] || 0;

      if (period === "weekly") {
        const jsDay = transaction.date.getDay();

        const mondayBasedIndex = jsDay === 0 ? 6 : jsDay - 1;

        totals[mondayBasedIndex].value += amount;
      } else {
        const monthIndex = transaction.date.getMonth();

        totals[monthIndex].value += amount;
      }
    }

    return totals;
  }
  async deleteManyByWorkspaceId(workspaceId: string): Promise<void> {
    await this.model
      .deleteMany({
        workspaceId: this.toObjectId(workspaceId),
      })
      .exec();
  }
}
