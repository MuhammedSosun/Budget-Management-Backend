import { z } from "zod";

export const createBudgetLimitSchema = z.object({
  category: z
    .string()
    .trim()
    .min(2, "Kategori en az 2 karakter olmalıdır.")
    .max(50, "Kategori en fazla 50 karakter olabilir."),

  limit: z.object({
    amount: z
      .union([z.number(), z.string()])
      .transform((val) => Number(val))
      .pipe(
        z
          .number("Lütfen geçerli bir limit miktarı giriniz.")
          .positive("Limit miktarı 0'dan büyük olmalıdır.")
          .max(10000000, "Limit miktarı çok yüksek.")
          .refine(
            (val) => {
              const decimals = val.toString().split(".")[1];
              return !decimals || decimals.length <= 2;
            },
            {
              message: "En fazla 2 ondalık basamak girebilirsiniz.",
            },
          ),
      ),

    currency: z.enum(["TRY", "USD", "EUR"]),
  }),

  period: z.enum(["monthly"]).default("monthly"),
});

export const updateBudgetLimitSchema = z
  .object({
    category: z
      .string()
      .trim()
      .min(2, "Kategori en az 2 karakter olmalıdır.")
      .max(50, "Kategori en fazla 50 karakter olabilir.")
      .optional(),

    limit: z
      .object({
        amount: z
          .union([z.number(), z.string()])
          .transform((val) => Number(val))
          .pipe(
            z
              .number()
              .positive("Limit miktarı 0'dan büyük olmalıdır.")
              .max(10000000, "Limit miktarı çok yüksek.")
              .refine(
                (val) => {
                  const decimals = val.toString().split(".")[1];
                  return !decimals || decimals.length <= 2;
                },
                {
                  message: "En fazla 2 ondalık basamak girebilirsiniz.",
                },
              ),
          ),

        currency: z.enum(["TRY", "USD", "EUR"]),
      })
      .optional(),

    period: z.enum(["monthly"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Güncellenecek en az bir alan gönderilmelidir.",
  });
