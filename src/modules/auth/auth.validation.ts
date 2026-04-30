import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Geçersiz email formatı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  firstName: z.string().min(2, "İsim çok kısa"),
  lastName: z.string().min(2, "Soyisim çok kısa"),
});
