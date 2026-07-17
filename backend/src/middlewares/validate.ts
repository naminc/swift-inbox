import { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/api-error";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw ApiError.validation(
        `Invalid ${source} payload`,
        result.error.flatten()
      );
    }

    req[source] = result.data;
    next();
  };
}
