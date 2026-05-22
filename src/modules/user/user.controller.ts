import { NextFunction, Request, Response } from "express";
import { AppError } from "../../exceptions/AppError";
import { StorageService } from "./storage.service";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { ErrorCode } from "../../exceptions/ErrorCodes";

const userRepository = new UserRepository();
const storageService = new StorageService();
const userService = new UserService(userRepository, storageService);

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 401);
    }

    const result = await userService.updateMe(req.user.userId, req.body);

    return res.status(200).json({
      message: "Profil bilgileri başarıyla güncellendi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 401);
    }

    if (!req.file) {
      throw new AppError(ErrorCode.AVATAR_REQUIRED, 400);
    }

    const result = await userService.updateAvatar(req.user.userId, req.file);

    return res.status(200).json({
      message: "Profil fotoğrafı başarıyla güncellendi.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 401);
    }

    await userService.updatePassword(req.user.userId, req.body);

    return res.status(200).json({
      message: "Şifre başarıyla güncellendi.",
    });
  } catch (error) {
    next(error);
  }
};
