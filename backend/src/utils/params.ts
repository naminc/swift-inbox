import type { Request } from "express";
import { ApiError } from "./api-error";

export function getStringParam(
  req: Request,
  name: string,
  errorMessage = `Invalid ${name}`
) {
  const value = req.params[name];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw ApiError.badRequest(errorMessage);
  }

  return value;
}

export function getPositiveIntParam(
  req: Request,
  name: string,
  errorMessage = `Invalid ${name}`
) {
  const rawValue = getStringParam(req, name, errorMessage);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw ApiError.badRequest(errorMessage);
  }

  return value;
}
