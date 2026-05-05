import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import {
  generateAccessToken,
  generateRefreshToken,
  verfiyRefreshToken,
} from "../../utils/token";
import { RegisterRequest } from "./auth.types";
import { UserEntity } from "../../domains/entities/UserEntity";
import { AppError } from "../../exceptions/AppError";
import { ErrorMessages } from "../../exceptions/errorMessages";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthService {
  private readonly googleClient: OAuth2Client;
  constructor(private readonly authRepository: IAuthRepository) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  async register(data: RegisterRequest): Promise<UserEntity> {
    const user = await this.authRepository.findByEmail(data.email);
    if (user) {
      throw new AppError(ErrorMessages.USER_ALREADY_EXISTS, 400);
    }
    const newUser = await this.authRepository.create(data);
    return {
      id: newUser._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }
  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }
    if (!user.password) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: payload.userId });

    user.refreshToken = refreshToken;

    await user.save();
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }
  async googleLogin(
    credential: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new AppError(ErrorMessages.GOOGLE_ACCOUNT_IS_NOT_VERIFIED, 401);
    }
    if (!payload.email_verified) {
      throw new AppError(
        ErrorMessages.GOOGLE_EMAIL_ACCOUNT_IS_NOT_VERIFIED,
        401,
      );
    }
    let user = await this.authRepository.findByGoogleId(payload.sub);
    if (!user) {
      user = await this.authRepository.findByEmail(payload.email);
    }
    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      if (user.authProvider === "local") {
        user.authProvider = "both";
      }
      user.isEmailVerified = true;
      if (!user.avatarUrl && payload.picture) {
        user.avatarUrl = payload.picture;
      }
      await user.save();
    }
    if (!user) {
      user = await this.authRepository.create({
        email: payload.email,
        firstName: payload.given_name || "Google",
        lastName: payload.family_name || "User",
        avatarUrl: payload.picture || "",
        authProvider: "google",
        googleId: payload.sub,
        isEmailVerified: true,
      });
    }
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: tokenPayload.userId });
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }
  async refreshAccessToken(incomingRefreshToken: string) {
    const decoded = verfiyRefreshToken(incomingRefreshToken);
    if (!decoded) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }

    const user = await this.authRepository.findById(decoded.userId);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });
    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, newRefreshToken, user: payload };
  }

  async logoutByToken(refreshToken: string) {
    const user = await this.authRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }
    user.refreshToken = null;
    await user.save();
    return { message: "Çıkış Başarılı" };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }
    return {
      message: "Kullanıcı Başarıyla getirildi",
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
