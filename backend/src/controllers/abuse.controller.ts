import { Request, Response } from "express";
import { STATUS_CODES } from "../constants/status-codes";
import {
  createAbuseReport,
  deleteAbuseReport,
  getAbuseReportById,
  listAbuseReports,
  updateAbuseReportStatus
} from "../services/abuse.service";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { getPositiveIntParam } from "../utils/params";
import {
  createAbuseReportSchema,
  updateAbuseReportStatusSchema
} from "../validators/abuse.validators";

const getIdParam = (req: Request) =>
  getPositiveIntParam(req, "id", "Invalid abuse report id");

function getClientIp(req: Request) {
  return req.ip || null;
}

export const postAbuseReport = AsyncHandler(
  async (req: Request, res: Response) => {
    const result = createAbuseReportSchema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.validation(
        "Invalid abuse report payload",
        result.error.flatten()
      );
    }

    const report = await createAbuseReport({
      ...result.data,
      email: result.data.email ?? null,
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent") ?? null
    });

    return ApiResponse.created(res, "Abuse report submitted", report);
  }
);

export const getAbuseReports = AsyncHandler(
  async (req: Request, res: Response) => {
    const reports = await listAbuseReports(req.query as never);

    return ApiResponse.ok(res, "Abuse reports fetched", reports);
  }
);

export const getAbuseReport = AsyncHandler(
  async (req: Request, res: Response) => {
    const report = await getAbuseReportById(getIdParam(req));

    return ApiResponse.ok(res, "Abuse report fetched", report);
  }
);

export const patchAbuseReportStatus = AsyncHandler(
  async (req: Request, res: Response) => {
    const result = updateAbuseReportStatusSchema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.validation(
        "Invalid status payload",
        result.error.flatten()
      );
    }

    const report = await updateAbuseReportStatus(
      getIdParam(req),
      result.data.status
    );

    return ApiResponse.ok(res, "Abuse report status updated", report);
  }
);

export const removeAbuseReport = AsyncHandler(
  async (req: Request, res: Response) => {
    await deleteAbuseReport(getIdParam(req));

    return ApiResponse.Success(
      res,
      "Abuse report deleted",
      null,
      STATUS_CODES.OK
    );
  }
);
