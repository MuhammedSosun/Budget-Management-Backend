import { Document, model, Schema, Types } from "mongoose";

export type BudgetPeriod = "monthly";
export type CurrencyCode = "TRY" | "USD" | "EUR";

export interface IBudgetLimit extends Document {
  workspaceId: Types.ObjectId;
  category: string;
  limit: {
    amount: number;
    currency: CurrencyCode;
  };
  period: BudgetPeriod;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetLimitSchema = new Schema<IBudgetLimit>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    limit: {
      amount: {
        type: Number,
        required: true,
        min: 1,
        max: 10000000,
      },
      currency: {
        type: String,
        required: true,
        enum: ["TRY", "USD", "EUR"],
        default: "TRY",
      },
    },

    period: {
      type: String,
      required: true,
      enum: ["monthly"],
      default: "monthly",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

budgetLimitSchema.index(
  {
    workspaceId: 1,
    category: 1,
    period: 1,
  },
  {
    unique: true,
  },
);

budgetLimitSchema.index({ workspaceId: 1, createdBy: 1 });

export default model<IBudgetLimit>("BudgetLimit", budgetLimitSchema);
