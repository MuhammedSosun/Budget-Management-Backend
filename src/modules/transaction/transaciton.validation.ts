import { z } from "zod";

export const TransactionSchema = z.object({
  title: z
    .string()
    .min(3, "Başlık en az 3 kelime olmalı")
    .max(50, "Başlık çok uzun"),

  input_details: z.object({
    amount: z
      .union([z.number(), z.string()])
      .transform((val) => Number(val))
      .pipe(
        z
          .number("Lütfen geçerli bir rakam giriniz")
          .positive("Miktar 0'dan büyük olmalıdır")
          .max(10000000, "Limit aşıldı")
          .refine(
            (val) => {
              const decimals = val.toString().split(".")[1];
              return !decimals || decimals.length <= 2;
            },
            { message: "En fazla 2 ondalık basamak girebilirsiniz" },
          ),
      ),
    currency: z.enum(["TRY", "USD", "EUR"]),
  }),

  type: z.enum(["income", "expense"]),
  category: z.string().min(3, "Kategori seçimi zorunludur"),
  date: z
    .string()
    .min(1, "Tarih seçimi zorunludur")
    .transform((val) => new Date(val)),
  description: z.string().max(200, "Açıklama 200 karakteri geçemez").optional(),
  userId: z.string().optional(),
});
