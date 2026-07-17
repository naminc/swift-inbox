import { z } from "zod";

export const updateReadSchema = z.object({
  isRead: z.boolean().optional()
});

export const mailboxAddressQuerySchema = z.object({
  mailboxAddress: z.string().trim().toLowerCase().email().max(254)
});
