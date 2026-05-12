import { Document, model, Schema, Types } from "mongoose";

export interface IEmailVerification extends Document {
  userId: Types.ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<IEmailVerification>(
  "EmailVerification",
  emailVerificationSchema,
);
