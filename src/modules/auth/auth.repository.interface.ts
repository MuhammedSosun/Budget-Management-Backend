import { IUser } from "../../models/user.model";
import { IBaseRepository } from "../../repository/IBaseRepository";

export interface IAuthRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByRefreshToken(token: string): Promise<IUser | null>;
}
