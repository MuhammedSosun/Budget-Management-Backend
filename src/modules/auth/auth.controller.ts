import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { EmailVerificationRepository } from "./email-verification.repository";
import { WorkspaceRepository } from "../workspace/workspace.repository";
import { WorkspaceMemberRepository } from "../workspace/workspace-member/workspace-member.repository";
import { WorkspaceService } from "../workspace/workspace.service";
import { WorkspaceInvitationRepository } from "../workspace/workspace-invitation/workspace-invitation.repository";
import { TransactionRepository } from "../transaction/transaction.repository";
import { BudgetLimitRepository } from "../budget-limit/budget-limit.repository";
import { BudgetUsageService } from "../budget-limit/budget-usage.service";



const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
} as const;
const authRepo = new AuthRepository();
const emailVerificationRepository = new EmailVerificationRepository();

const workspaceRepository = new WorkspaceRepository();
const workspaceMemberRepository = new WorkspaceMemberRepository();
const workspaceInvitationRepository = new WorkspaceInvitationRepository();
const transactionRepository = new TransactionRepository();
const budgetLimitRepository = new BudgetLimitRepository();
const budgetUsageService = new BudgetUsageService(
  budgetLimitRepository,
  transactionRepository
);

const workspaceService = new WorkspaceService(
  workspaceRepository,
  workspaceMemberRepository,
  workspaceInvitationRepository,
  transactionRepository,
  budgetLimitRepository,
  budgetUsageService
);

const authService = new AuthService(
  authRepo,
  emailVerificationRepository,
  workspaceService,
);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const request = req.body;
    const result = await authService.login(request.email, request.password);

    res.cookie("refreshToken", result.refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: 4 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Giriş başarılı",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: "Google credential zorunludur",
      });
    }
    const result = await authService.googleLogin(credential);
    res.cookie("refreshToken", result.refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: 4 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Google ile başarıyla giriş yapıldı",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = req.body;

    const result = await authService.verifyEmail(email, code);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const result = await authService.resendVerificationCode(email);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Oturum Süresi dolmuş lütfen tekrar giriş yapın" });
  }
  try {
    const { accessToken, newRefreshToken, user } =
      await authService.refreshAccessToken(token);
    res.cookie("refreshToken", newRefreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: 4 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logoutByToken(refreshToken);
    }

    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.status(200).json({ message: "Başarıyla çıkış yapıldı" });
  } catch (error) {
    next(error);
  }
};
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getMe(req.user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
