import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Geçersiz email formatı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  firstName: z.string().min(2, "İsim çok kısa"),
  lastName: z.string().min(2, "Soyisim çok kısa"),
});

export const LoginSchema = z.object({
  email: z.string().email("Geçersiz email formatı"),
  password: z.string().min(1, "Şifre zorunludur"),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email("Geçersiz email formatı"),
  code: z
    .string()
    .min(6, "Doğrulama kodu 6 haneli olmalıdır")
    .max(6, "Doğrulama kodu 6 haneli olmalıdır"),
});

export const ResendVerificationCodeSchema = z.object({
  email: z.string().email("Geçersiz email formatı"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Şifre sıfırlama token zorunludur."),

    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır.")
      .max(72, "Şifre en fazla 72 karakter olabilir."),

    confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor.",
  });
