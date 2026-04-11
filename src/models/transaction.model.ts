import { Document, model, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
    description?: string;
    userId: Types.ObjectId;

}

const transactionSchema = new Schema<ITransaction>({

    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true, default: '' },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default model<ITransaction>('Transaction', transactionSchema);