import { z } from "zod";

export const domainNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(253)
  .regex(
    /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/,
    "Domain must be a valid hostname"
  );

export const createDomainSchema = z.object({
  name: domainNameSchema,
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  label: z.string().trim().min(1).max(80).nullable().optional()
});

export const updateDomainSchema = createDomainSchema
  .partial()
  .refine(value => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });
