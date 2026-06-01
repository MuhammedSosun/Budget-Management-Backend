import bcrypt from "bcrypt";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { StorageService } from "./storage.service";
import { IUserRepository } from "./user.repository.interface";
import { UpdatePasswordInput, UpdateProfileInput } from "./user.validation";

const capitalizeWord = (word: string): string => {
  return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1);
};

const formatName = (value: string): string => {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.split("-").map(capitalizeWord).join("-"))
    .join(" ");
};

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly storageService: StorageService,
  ) {}

  async updateMe(userId: string, payload: UpdateProfileInput) {
    const firstName = formatName(payload.firstName);
    const lastName = formatName(payload.lastName);

    const updatedUser = await this.userRepository.updateProfileById(userId, {
      firstName,
      lastName,
    });

    if (!updatedUser) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    const oldAvatarUrl = user.avatarUrl;

    const newAvatarUrl = await this.storageService.uploadAvatar(file, userId);

    const updatedUser = await this.userRepository.updateAvatarById(
      userId,
      newAvatarUrl,
    );

    if (!updatedUser) {
      await this.storageService.deleteFileByUrl(newAvatarUrl);
      throw new AppError(ErrorCode.AVATAR_UPDATE_FAILED, 500);
    }

    if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
      await this.storageService.deleteFileByUrl(oldAvatarUrl);
    }

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async updatePassword(userId: string, payload: UpdatePasswordInput) {
    const user = await this.userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
    }

    if (!user.password) {
      throw new AppError(ErrorCode.GOOGLE_ACCOUNT_PASSWORD_NOT_AVAILABLE, 400);
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      payload.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      throw new AppError(ErrorCode.PASSWORD_MISMATCH, 400);
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    let nextAuthProvider = user.authProvider;

    if (user.authProvider === "google") {
      nextAuthProvider = "both";
    }

    const updatedUser = await this.userRepository.updatePasswordById(
      userId,
      hashedPassword,
      nextAuthProvider,
    );

    if (!updatedUser) {
      throw new AppError(ErrorCode.PASSWORD_UPDATE_FAILED, 500);
    }

    return {
      message: "Şifre başarıyla güncellendi.",
    };
  }
}
