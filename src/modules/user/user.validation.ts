import { z } from "zod";

export const UpdateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ad en az 2 karakter olmalıdır.")
      .max(50, "Ad en fazla 50 karakter olabilir."),

    lastName: z
      .string()
      .trim()
      .min(2, "Soyad en az 2 karakter olmalıdır.")
      .max(50, "Soyad en fazla 50 karakter olabilir."),
  })
  .strict();

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre zorunludur."),

    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),

    confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Yeni şifreler eşleşmiyor.",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "Yeni şifre mevcut şifre ile aynı olamaz.",
  });

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
