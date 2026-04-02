import { model, Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUser extends Document {
  username: string;
  password: string;
  refreshToken?: string | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
