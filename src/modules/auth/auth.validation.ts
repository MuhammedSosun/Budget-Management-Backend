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
