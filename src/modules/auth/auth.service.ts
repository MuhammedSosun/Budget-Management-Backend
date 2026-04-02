import { AuthRepository } from './auth.repository';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verfiyRefreshToken } from "../../utils/token";
import { userInfo } from 'node:os';

export class AuthService {
  private authRepository = new AuthRepository();

  async register(username: string, password: string) {
    return await this.authRepository.createUser({ username, password });
  }
  async login(username: string, password: string) {
    const user = await this.authRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('user Not Found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Kullanıcı adı veya şifre hatalı!');
    }
    const payload = {
      userId: user._id.toString(),
      username: user.username
    }
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: payload.userId });

    user.refreshToken = refreshToken;

    await user.save();
    return {
      user: {
        id: user._id,
        username: user.username
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
      username: user.username
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
  async updateUser(id: string, username: string, password: string) {
    const user = await this.authRepository.findUserById(id);
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }
    const updatedUser = await this.authRepository.updateUser(id, { username, password: hashedPassword });
    return updatedUser;
  }
}