import { model, Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  refreshToken?: string | null;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  avatarUrl: { type: String, default: "" },
  refreshToken: { type: String, default: null }
}, {
  timestamps: true,
  versionKey: false,
});
userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

export default model<IUser>('User', userSchema);
