import { z } from "zod";
import { paginationQuerySchema } from "../utils/pagination";

export const createAbuseReportSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: z.string().trim().min(10).max(5000)
});

export const listAbuseReportsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(254).optional()
});

export const updateAbuseReportStatusSchema = z.object({
  status: z.enum(["new", "reviewed", "resolved"])
});
