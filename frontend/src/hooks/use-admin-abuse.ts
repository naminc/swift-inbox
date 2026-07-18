import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  deleteAbuseReport,
  getAbuseReport,
  listAbuseReports,
  updateAbuseReportStatus,
} from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { AbuseReport, AbuseReportListResponse, AbuseReportStatus } from "@/types/abuse";

const PAGE_LIMIT = 10;

const EMPTY_REPORTS: AbuseReportListResponse = {
  items: [],
  meta: {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  },
};

export function previewMessage(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function useAdminAbuse(table: { params: Parameters<typeof listAbuseReports>[0] }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selectedReportSummary, setSelectedReportSummary] = useState<AbuseReport | null>(null);

  const reportsQuery = useQuery({
    queryKey: queryKeys.abuseReports(table.params),
    queryFn: () => listAbuseReports(table.params),
    placeholderData: keepPreviousData,
  });

  const selectedReportId = selectedReportSummary?.id ?? 0;
  const reportQuery = useQuery({
    queryKey: queryKeys.abuseReport(selectedReportId),
    queryFn: () => getAbuseReport(selectedReportId),
    enabled: Boolean(selectedReportId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AbuseReportStatus }) =>
      updateAbuseReportStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.abuseReport(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.abuseReportsRoot });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: deleteAbuseReport,
    onSuccess: (_data, reportId) => {
      queryClient.removeQueries({ queryKey: queryKeys.abuseReport(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.abuseReportsRoot });
    },
  });

  const reports = reportsQuery.data ?? EMPTY_REPORTS;
  const selectedReport = reportQuery.data ?? selectedReportSummary;
  const pageError =
    error ??
    (reportsQuery.isError
      ? errorMessage(reportsQuery.error, "Could not load abuse reports")
      : null);
  const reportError = reportQuery.isError
    ? errorMessage(reportQuery.error, "Could not load abuse report")
    : null;

  const openReport = (report: AbuseReport) => {
    setSelectedReportSummary(report);
    void queryClient.invalidateQueries({
      queryKey: queryKeys.abuseReport(report.id),
    });
  };

  const handleStatusChange = async (report: AbuseReport, status: AbuseReportStatus) => {
    if (status === report.status) return;
    setError(null);

    try {
      await updateStatusMutation.mutateAsync({ id: report.id, status });
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not update status"));
    }
  };

  const handleDelete = async (report: AbuseReport) => {
    const confirmed = window.confirm(`Delete abuse report #${report.id}?`);

    if (!confirmed) return;

    setError(null);

    try {
      await deleteReportMutation.mutateAsync(report.id);

      if (selectedReportSummary?.id === report.id) {
        setSelectedReportSummary(null);
      }
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not delete abuse report"));
    }
  };

  return {
    reports,
    isLoading: reportsQuery.isPending,
    isFetching: reportsQuery.isFetching,
    refetch: reportsQuery.refetch,
    pageError,
    totalPages: reports.meta.totalPages || 1,
    selectedReport,
    isReportOpen: Boolean(selectedReportSummary),
    isReportLoading: reportQuery.isPending,
    reportError,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    openReport,
    closeReport: () => setSelectedReportSummary(null),
    handleStatusChange,
    handleDelete,
  };
}
