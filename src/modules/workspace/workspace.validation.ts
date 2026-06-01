import { z } from "zod";

export const createWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Workspace adı en az 2 karakter olmalıdır.")
      .max(80, "Workspace adı en fazla 80 karakter olabilir."),

    description: z
      .string()
      .trim()
      .max(250, "Açıklama en fazla 250 karakter olabilir.")
      .optional(),
  })
  .strict();

export const createWorkspaceInvitationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    role: z.enum(["EDITOR", "VIEWER"]),
  })
  .strict();

export const updateWorkspaceMemberRoleSchema = z
  .object({
    role: z.enum(["EDITOR", "VIEWER"]),
  })
  .strict();

export const updateWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Workspace adı en az 2 karakter olmalıdır.")
      .max(60, "Workspace adı en fazla 60 karakter olabilir.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(250, "Açıklama en fazla 250 karakter olabilir.")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "Güncellenecek en az bir alan gönderilmelidir.",
  });
