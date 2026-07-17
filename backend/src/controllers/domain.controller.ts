import { Request, Response } from "express";
import { STATUS_CODES } from "../constants/status-codes";
import {
  createDomain,
  deleteDomain,
  getDomainById,
  listDomains,
  listPublicDomains,
  updateDomain
} from "../services/domain.service";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { getPositiveIntParam } from "../utils/params";
import {
  createDomainSchema,
  updateDomainSchema
} from "../validators/domain.validators";

const getIdParam = (req: Request) =>
  getPositiveIntParam(req, "id", "Invalid domain id");

export const getPublicDomains = AsyncHandler(
  async (_req: Request, res: Response) => {
    const domains = await listPublicDomains();

    return ApiResponse.ok(res, "Public domains fetched", domains);
  }
);

export const getDomains = AsyncHandler(async (_req: Request, res: Response) => {
  const domains = await listDomains();

  return ApiResponse.ok(res, "Domains fetched", domains);
});

export const getDomain = AsyncHandler(async (req: Request, res: Response) => {
  const domain = await getDomainById(getIdParam(req));

  return ApiResponse.ok(res, "Domain fetched", domain);
});

export const postDomain = AsyncHandler(async (req: Request, res: Response) => {
  const result = createDomainSchema.safeParse(req.body);

  if (!result.success) {
    throw ApiError.validation("Invalid domain payload", result.error.flatten());
  }

  const domain = await createDomain(result.data);

  return ApiResponse.created(res, "Domain created", domain);
});

export const patchDomain = AsyncHandler(async (req: Request, res: Response) => {
  const result = updateDomainSchema.safeParse(req.body);

  if (!result.success) {
    throw ApiError.validation("Invalid domain payload", result.error.flatten());
  }

  const domain = await updateDomain(getIdParam(req), result.data);

  return ApiResponse.ok(res, "Domain updated", domain);
});

export const removeDomain = AsyncHandler(
  async (req: Request, res: Response) => {
    await deleteDomain(getIdParam(req));

    return ApiResponse.Success(res, "Domain deleted", null, STATUS_CODES.OK);
  }
);
