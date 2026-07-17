import dotenv from "dotenv-flow";
dotenv.config();
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.string().regex(/^\d+$/, "PORT must be a number").transform(Number),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  CORS_ORIGIN: z.url(),

  DATABASE_URL: z.url(),

  ADMIN_EMAIL: z.email(),

  ADMIN_PASSWORD: z.string().min(8),

  AUTH_SECRET: z.string().min(32),

  AUTH_COOKIE_NAME: z.string().min(1).default("swift_inbox_admin"),

  AUTH_TOKEN_TTL_SECONDS: z
    .string()
    .regex(/^\d+$/, "AUTH_TOKEN_TTL_SECONDS must be a number")
    .default("86400")
    .transform(Number),

  CLEANUP_INTERVAL_SECONDS: z
    .string()
    .regex(/^\d+$/, "CLEANUP_INTERVAL_SECONDS must be a number")
    .default("600")
    .transform(Number)
    .refine(value => value > 0, "CLEANUP_INTERVAL_SECONDS must be positive"),

  INBOUND_WEBHOOK_SECRET: z.string().min(32)
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  process.stderr.write("Invalid environment configuration\n");
  process.stderr.write(`${z.prettifyError(result.error)}\n`);
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);

export default env;
