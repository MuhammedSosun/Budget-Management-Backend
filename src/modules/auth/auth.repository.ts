import User, { IUser } from "../../models/user.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthRepository
  extends BaseRepository<IUser>
  implements IAuthRepository
{
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email }).exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await this.model.findOne({ refreshToken }).exec();
  }
}
