import { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/api-error";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw ApiError.validation(
        `Invalid ${source} payload`,
        result.error.flatten()
      );
    }

    if (source === "query") {
      // Express 5: req.query is a read-only getter and cannot be reassigned.
      // Expose the parsed/coerced value via res.locals for controllers.
      res.locals.query = result.data;
    } else {
      req[source] = result.data;
    }

    next();
  };
}
