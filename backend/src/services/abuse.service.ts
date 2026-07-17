import type { Prisma } from "@prisma/client";
import prisma from "../configs/prisma";
import { assertMaintenanceModeDisabled } from "./settings.service";
import { ApiError } from "../utils/api-error";
import { buildMeta } from "../utils/pagination";

type CreateAbuseReportInput = {
  email?: string | null;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type ListAbuseReportsInput = {
  search?: string;
  page: number;
  limit: number;
};

export async function createAbuseReport(input: CreateAbuseReportInput) {
  await assertMaintenanceModeDisabled();

  return prisma.abuseReport.create({
    data: {
      email: input.email ?? null,
      message: input.message,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null
    }
  });
}

export async function listAbuseReports(input: ListAbuseReportsInput) {
  const where: Prisma.AbuseReportWhereInput = {
    ...(input.search && {
      OR: [
        { email: { contains: input.search } },
        { message: { contains: input.search } },
        { ipAddress: { contains: input.search } }
      ]
    })
  };

  const skip = (input.page - 1) * input.limit;

  const [items, total] = await prisma.$transaction([
    prisma.abuseReport.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.abuseReport.count({ where })
  ]);

  return {
    items,
    meta: buildMeta(total, input.page, input.limit)
  };
}

export async function getAbuseReportById(id: number) {
  const report = await prisma.abuseReport.findUnique({
    where: { id }
  });

  if (!report) {
    throw ApiError.notFound("Abuse report not found");
  }

  return report;
}

export async function updateAbuseReportStatus(id: number, status: string) {
  await getAbuseReportById(id);

  return prisma.abuseReport.update({
    where: { id },
    data: { status }
  });
}

export async function deleteAbuseReport(id: number) {
  await getAbuseReportById(id);

  await prisma.abuseReport.delete({
    where: { id }
  });
}
