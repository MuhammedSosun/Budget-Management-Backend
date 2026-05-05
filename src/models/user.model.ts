import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  refreshToken?: string | null;
  authProvider: "local" | "google" | "both";
  googleId?: string;
  isEmailVerified?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
userSchema.pre<IUser>("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.log(error);
  }
});

export default model<IUser>("User", userSchema);
