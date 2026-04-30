import { Document, model, Schema, Types } from "mongoose";
export type TransactionType = "income" | "expense";
export type CurrencyCode = "TRY" | "USD" | "EUR";
export interface ITransaction extends Document {
  title: string;
  input_details: {
    amount: number;
    currency: CurrencyCode;
  };
  conversions: {
    TRY: number;
    USD: number;
    EUR: number;
  };
  type: TransactionType;
  category: string;
  date: Date;
  description?: string;
  userId: Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    title: { type: String, required: true, trim: true },
    input_details: {
      amount: { type: Number, required: true, min: 0 },
      currency: {
        type: String,
        required: true,
        enum: ["TRY", "USD", "EUR"],
        default: "TRY",
      },
    },
    conversions: {
      TRY: { type: Number, required: true },
      USD: { type: Number, required: true },
      EUR: { type: Number, required: true },
    },
    type: { type: String, required: true, enum: ["income", "expense"] },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true, default: "" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<ITransaction>("Transaction", transactionSchema);
