export type AbuseReportStatus = "new" | "reviewed" | "resolved";

export type AbuseReport = {
  id: number;
  email: string | null;
  message: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: AbuseReportStatus;
  createdAt: string;
};

export type CreateAbuseReportInput = {
  email?: string;
  message: string;
};

export type ListAbuseReportsParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type AbuseReportListResponse = {
  items: AbuseReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
