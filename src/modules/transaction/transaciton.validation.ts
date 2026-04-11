import { z } from "zod"

export const TransactionSchema = z.object({
    title: z.string().min(3, "Başlık en az 3 kelime olmalı"),
    amount: z.number().positive("Miktar pozitif olmalı"),
    type: z.enum(["income", "expense"]),
    category: z.string().min(3, "Kategori en az 3 kelime olmalı"),
    date: z.string().transform((val) => new Date(val)),
    description: z.string().optional(),
    userId: z.string().optional(),
});