import { AuthRepository } from './auth.repository';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verfiyRefreshToken } from "../../utils/token";
import { RegisterRequest } from '../../types/auth.types';
import User from '../../models/user.model';
import { UserEntity } from '../../domains/entities/UserEntity';

export class AuthService {
  private authRepository = new AuthRepository();

  async register(data: RegisterRequest): Promise<UserEntity> {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (user) {
      throw new Error("Kullanıcı zaten mevcut")
    }
    const newUser = await User.create(data);
    return {
      id: newUser._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

  }
  async login(email: string, password: string): Promise<{ user: UserEntity, accessToken: string, refreshToken: string }> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('kullanıcı bulunamadı awdawd awda w');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Kullanıcı adı veya şifre hatalı!');
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email
    }
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: payload.userId });

    user.refreshToken = refreshToken;

    await user.save();
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      accessToken,
      refreshToken
    };
  }
  async refreshAccessToken(incomingRefreshToken: string) {

    const decoded = verfiyRefreshToken(incomingRefreshToken);
    if (!decoded) {
      throw new Error("Geçersiz veya süresi dolmuş RefreshTOken ")
    }

    const user = await this.authRepository.findUserById(decoded.userId);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new Error('Refresh token eşleşmiyor veya kullanıcı bulunamadı');
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email
    }

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString()
    })
    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, newRefreshToken, user: payload };
  }

  async logout(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("Kullanıcı Bulunamadı")
    }
    user.refreshToken = null;
    await user.save();
    return { message: "Çıkış Başarılı" };
  }
  async findAll() {
    const users = await this.authRepository.findAll();
    if (!users) {
      throw new Error('Kullanıcı bulunamadı');
    }
    return users;
  }
  async deleteUserById(id: string) {
    const user = await this.authRepository.deleteUser(id);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }
    return user;
  }
  async updateUser(id: string, data: RegisterRequest) {
    const user = await this.authRepository.findUserById(id);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }
    const updatedUser = await this.authRepository.updateUser(id, { email: data.email, password: hashedPassword, firstName: data.firstName, lastName: data.lastName });
    return updatedUser;
  }
}