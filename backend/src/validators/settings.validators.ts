import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    siteName: z.string().trim().min(1).max(80).optional(),
    siteTitle: z.string().trim().min(1).max(120).optional(),
    heroHeading: z.string().trim().min(1).max(120).optional(),
    heroSubheading: z.string().trim().min(1).max(180).optional(),
    metaKeywords: z.string().trim().min(1).max(300).optional(),
    metaDescription: z.string().trim().min(1).max(300).optional(),
    metaAuthor: z.string().trim().min(1).max(80).optional(),
    supportEmail: z.email().optional(),
    defaultMailboxExpiryMinutes: z.coerce
      .number()
      .int()
      .min(1)
      .max(43_200)
      .optional(),
    maxMailboxMessages: z.coerce.number().int().min(1).max(10_000).optional(),
    randomLocalPartMinLength: z.coerce.number().int().min(3).max(32).optional(),
    randomLocalPartMaxLength: z.coerce.number().int().min(3).max(32).optional(),
    expiredMailboxRetentionDays: z.coerce
      .number()
      .int()
      .min(1)
      .max(365)
      .optional(),
    allowPublicMailboxCreation: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().trim().min(1).max(240).optional(),
    reservedLocalParts: z
      .array(z.string())
      .max(64, "Reserved usernames cannot exceed 64 entries")
      .optional()
      .transform(value =>
        value === undefined
          ? value
          : Array.from(
              new Set(
                value
                  .map(item => item.trim().toLowerCase())
                  .filter(item => item.length > 0)
              )
            )
      )
      .refine(
        value =>
          value === undefined ||
          value.every(item => /^[a-z0-9._-]+$/.test(item)),
        "Reserved usernames can only contain letters, numbers, dots, underscores, and hyphens"
      )
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one setting is required"
      });
    }

    if (
      value.randomLocalPartMinLength !== undefined &&
      value.randomLocalPartMaxLength !== undefined &&
      value.randomLocalPartMinLength > value.randomLocalPartMaxLength
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Random local part min length must be less than or equal to max length",
        path: ["randomLocalPartMinLength"]
      });
    }
  });
