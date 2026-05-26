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
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { IAuthRepository } from "./auth.repository.interface";
import { mailService } from "../mail/mail.service";
import { EmailVerificationRepository } from "./email-verification.repository";
import { WorkspaceService } from "../workspace/workspace.service";
import { Types } from "mongoose";

export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly workspaceService: WorkspaceService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(data: RegisterRequest) {
    const user = await this.authRepository.findByEmail(data.email);

    if (user) {
      throw new AppError(ErrorCode.USER_ALREADY_EXISTS, 409);
    }

    const newUser = await this.authRepository.create({
      ...data,
      isEmailVerified: false,
      authProvider: "local",
    });

    await this.workspaceService.createDefaultWorkspaceForUser({
      userId: newUser._id as Types.ObjectId,
      firstName: newUser.firstName,
    });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.emailVerificationRepository.deleteByEmail(newUser.email);

    await this.emailVerificationRepository.create({
      userId: newUser._id.toString(),
      email: newUser.email,
      code: verificationCode,
      expiresAt,
    });

    await mailService.sendVerificationCode({
      to: newUser.email,
      firstName: newUser.firstName,
      code: verificationCode,
    });

    return {
      email: newUser.email,
      requiresEmailVerification: true,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    if (!user.password) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401);
    }

    if (!user.isEmailVerified && user.authProvider !== "google") {
      throw new AppError(ErrorCode.EMAIL_NOT_VERIFIED, 403);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: payload.userId });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: this.mapUserResponse(user),
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
      throw new AppError(ErrorCode.GOOGLE_ACCOUNT_IS_NOT_VERIFIED, 401);
    }

    if (!payload.email_verified) {
      throw new AppError(ErrorCode.GOOGLE_EMAIL_ACCOUNT_IS_NOT_VERIFIED, 401);
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

      await this.workspaceService.createDefaultWorkspaceForUser({
        userId: user._id as Types.ObjectId,
        firstName: user.firstName,
      });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      userId: tokenPayload.userId,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: this.mapUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    if (user.isEmailVerified) {
      return {
        messageCode: "EMAIL_ALREADY_VERIFIED",
      };
    }

    const MAX_ATTEMPTS = 5;

    if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
      await this.emailVerificationRepository.deleteByEmail(email);

      user.emailVerificationAttempts = 0;
      await user.save();

      throw new AppError(ErrorCode.EMAIL_VERIFICATION_TOO_MANY_ATTEMPTS, 403);
    }

    const verification =
      await this.emailVerificationRepository.findByEmailAndCode(email, code);

    if (!verification) {
      user.emailVerificationAttempts += 1;
      await user.save();

      if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
        await this.emailVerificationRepository.deleteByEmail(email);

        user.emailVerificationAttempts = 0;
        await user.save();

        throw new AppError(ErrorCode.EMAIL_VERIFICATION_TOO_MANY_ATTEMPTS, 403);
      }

      throw new AppError(ErrorCode.EMAIL_VERIFICATION_CODE_INVALID, 400);
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      await this.emailVerificationRepository.deleteByEmail(email);

      throw new AppError(ErrorCode.EMAIL_VERIFICATION_CODE_EXPIRED, 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationAttempts = 0;
    await user.save();

    await this.emailVerificationRepository.deleteByEmail(email);

    return {
      messageCode: "EMAIL_VERIFIED_SUCCESSFULLY",
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    if (user.isEmailVerified) {
      throw new AppError(ErrorCode.EMAIL_ALREADY_VERIFIED, 400);
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.emailVerificationRepository.deleteByEmail(user.email);

    await this.emailVerificationRepository.create({
      userId: user._id.toString(),
      email: user.email,
      code: verificationCode,
      expiresAt,
    });

    user.emailVerificationAttempts = 0;
    await user.save();

    await mailService.sendVerificationCode({
      to: user.email,
      firstName: user.firstName,
      code: verificationCode,
    });

    return {
      messageCode: "EMAIL_VERIFICATION_CODE_SENT",
    };
  }

  async refreshAccessToken(incomingRefreshToken: string) {
    const decoded = verfiyRefreshToken(incomingRefreshToken);

    if (!decoded) {
      throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID, 401);
    }

    const user = await this.authRepository.findById(decoded.userId);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID, 401);
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

    return {
      accessToken,
      newRefreshToken,
      user: this.mapUserResponse(user),
    };
  }

  async logoutByToken(refreshToken: string) {
    const user = await this.authRepository.findByRefreshToken(refreshToken);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    user.refreshToken = null;
    await user.save();

    return {
      messageCode: "LOGOUT_SUCCESS",
    };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    return {
      messageCode: "USER_FETCHED_SUCCESSFULLY",
      user: this.mapUserResponse(user),
    };
  }

  private mapUserResponse(user: any): UserEntity {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl || "",
    };
  }
}