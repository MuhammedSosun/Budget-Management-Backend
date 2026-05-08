import { IUser } from "../../models/user.model";
import { IBaseRepository } from "../../repository/IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  updateProfileById(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ): Promise<IUser | null>;

  updateAvatarById(userId: string, avatarUrl: string): Promise<IUser | null>;

  findByIdWithPassword(userId: string): Promise<IUser | null>;

  updatePasswordById(
    userId: string,
    hashedPassword: string,
    authProvider: "local" | "google" | "both",
  ): Promise<IUser | null>;
}
