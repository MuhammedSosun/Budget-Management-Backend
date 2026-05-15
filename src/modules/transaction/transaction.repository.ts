import { Types } from "mongoose";
import Transaction, {
  CurrencyCode,
  ITransaction,
} from "../../models/transaction.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository {
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
      this.model.find(query).limit(limit).skip(offset).sort(sortOption).exec(),
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

        /**
         * JavaScript getDay():
         * 0 = Pazar
         * 1 = Pazartesi
         * 2 = Salı
         *
         * Bizim labels dizimiz:
         * 0 = Pzt
         * 1 = Sal
         * ...
         * 6 = Paz
         */
        const mondayBasedIndex = jsDay === 0 ? 6 : jsDay - 1;

        totals[mondayBasedIndex].value += amount;
      } else {
        const monthIndex = transaction.date.getMonth();

        totals[monthIndex].value += amount;
      }
    }

    return totals;
  }
}