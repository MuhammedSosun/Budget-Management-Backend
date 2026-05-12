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
import { mailService } from "../mail/mail.service";
import { EmailVerificationRepository } from "./email-verification.repository";

export class AuthService {
  private readonly googleClient: OAuth2Client;
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  async register(data: RegisterRequest) {
    const user = await this.authRepository.findByEmail(data.email);

    if (user) {
      throw new AppError(ErrorMessages.USER_ALREADY_EXISTS, 400);
    }

    const newUser = await this.authRepository.create({
      ...data,
      isEmailVerified: false,
      authProvider: "local",
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
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }
    if (!user.password) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    if (!user.isEmailVerified && user.authProvider !== "google") {
      throw new AppError("Lütfen önce e-posta adresinizi doğrulayın.", 403);
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
      user: this.mapUserResponse(user),
      accessToken,
      refreshToken,
    };
  }
  async verifyEmail(email: string, code: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }

    if (user.isEmailVerified) {
      return {
        message: "E-posta adresi zaten doğrulanmış.",
      };
    }
    const MAX_ATTEMPTS = 5;
    if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
      await this.emailVerificationRepository.deleteByEmail(email);
      user.emailVerificationAttempts = 0;
      await user.save();

      throw new AppError(
        "Çok fazla hatalı deneme yaptınız. Güvenliğiniz için kod iptal edildi, lütfen yeni bir kod isteyin.",
        403,
      );
    }

    const verification =
      await this.emailVerificationRepository.findByEmailAndCode(email, code);

    if (!verification) {
      user.emailVerificationAttempts += 1;
      await user.save();

      const remaining = MAX_ATTEMPTS - user.emailVerificationAttempts;
      throw new AppError(
        `Doğrulama kodu hatalı. ${remaining} deneme hakkınız kaldı.`,
        400,
      );
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      await this.emailVerificationRepository.deleteByEmail(email);

      throw new AppError("Doğrulama kodunun süresi doldu.", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationAttempts = 0;
    await user.save();

    await this.emailVerificationRepository.deleteByEmail(email);

    return {
      message: "E-posta adresi başarıyla doğrulandı.",
    };
  }
  async resendVerificationCode(email: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("E-posta adresi zaten doğrulanmış.", 400);
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

    await mailService.sendVerificationCode({
      to: user.email,
      firstName: user.firstName,
      code: verificationCode,
    });

    return {
      message: "Yeni doğrulama kodu gönderildi.",
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

    return { accessToken, newRefreshToken, user: this.mapUserResponse(user) };
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
