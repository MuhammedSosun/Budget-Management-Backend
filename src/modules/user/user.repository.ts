import User, { IUser } from "../../models/user.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { IUserRepository } from "./user.repository.interface";

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository {
  constructor() {
    super(User);
  }
  async updateProfileById(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(
        userId,
        {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .select("-password -refreshToken")
      .exec();
  }

  async updateAvatarById(
    userId: string,
    avatarUrl: string,
  ): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(
        userId,
        {
          avatarUrl,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .select("-password -refreshToken")
      .exec();
  }
  async findByIdWithPassword(userId: string): Promise<IUser | null> {
    return await this.model.findById(userId).exec();
  }

  async updatePasswordById(
    userId: string,
    hashedPassword: string,
    authProvider: "local" | "google" | "both",
  ): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(
        userId,
        {
          password: hashedPassword,
          authProvider,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email }).exec();
  }
}
