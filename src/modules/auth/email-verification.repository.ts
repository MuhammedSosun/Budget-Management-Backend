import EmailVerification, {
  IEmailVerification,
} from "../../models/emailVerification.model";

export class EmailVerificationRepository {
  async create(data: {
    userId: string;
    email: string;
    code: string;
    expiresAt: Date;
  }): Promise<IEmailVerification> {
    return await EmailVerification.create(data);
  }
  async findByEmailAndCode(
    email: string,
    code: string,
  ): Promise<IEmailVerification | null> {
    return await EmailVerification.findOne({
      email: email.toLowerCase().trim(),
      code,
    }).exec();
  }

  async deleteByEmail(email: string): Promise<void> {
    await EmailVerification.deleteMany({
      email: email.toLowerCase().trim(),
    }).exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await EmailVerification.deleteMany({ userId }).exec();
  }
}
