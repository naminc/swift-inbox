import { z } from "zod";
import { paginationQuerySchema } from "../utils/pagination";

export const localPartSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform(value =>
    value
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 32)
  )
  .refine(value => value.length > 0, "Local part is required")
  .refine(
    value => /^[a-z0-9._-]+$/.test(value),
    "Local part can only contain letters, numbers, dots, underscores, and hyphens"
  );

export const addressSchema = z.string().trim().toLowerCase().email().max(254);

export const createMailboxSchema = z.object({
  localPart: localPartSchema.optional(),
  domainId: z.coerce.number().int().positive().optional(),
  expiresInMinutes: z.coerce.number().int().positive().max(43_200).optional()
});

export const renewMailboxSchema = z.object({
  expiresInMinutes: z.coerce.number().int().positive().max(43_200).optional()
});

export const listMailboxesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(254).optional(),
  domainId: z.coerce.number().int().positive().optional()
});
