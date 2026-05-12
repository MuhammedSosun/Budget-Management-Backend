import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  googleLogin,
  verifyEmail,
  resendVerificationCode,
} from "../modules/auth/auth.controller";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { validate } from "../middlewares/validations/validate.middleware";
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendVerificationCodeSchema,
} from "../modules/auth/auth.validation";

const router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);
router.post("/google", googleLogin);

router.post("/verify-email", validate(VerifyEmailSchema), verifyEmail);
router.post(
  "/resend-verification-code",
  validate(ResendVerificationCodeSchema),
  resendVerificationCode,
);

router.post("/refresh-token", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
