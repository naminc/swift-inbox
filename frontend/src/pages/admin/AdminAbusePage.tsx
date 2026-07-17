import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminTableState } from "@/hooks/use-admin-table-state";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  deleteAbuseReport,
  getAbuseReport,
  listAbuseReports,
  updateAbuseReportStatus,
} from "@/lib/api";
import { formatDateTime } from "@/lib/date";
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

function preview(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function AdminAbusePage() {
  usePageTitle("Admin Abuse Reports - Swift Inbox");

  const queryClient = useQueryClient();
  const table = useAdminTableState({ limit: PAGE_LIMIT });
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
  const isLoading = reportsQuery.isPending;
  const pageError =
    error ??
    (reportsQuery.isError
      ? errorMessage(reportsQuery.error, "Could not load abuse reports")
      : null);
  const totalPages = reports.meta.totalPages || 1;

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

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Abuse Reports"
        description="Review contact messages and abuse reports submitted from the public site."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void reportsQuery.refetch()}
            disabled={reportsQuery.isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <AdminStatCards
        items={[
          { label: "Total reports", value: reports.meta.total },
          { label: "Current page", value: reports.meta.page },
          { label: "Total pages", value: totalPages },
        ]}
      />

      <div className="rounded-md border border-border bg-card p-2">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={table.search}
            onChange={(event) => table.handleSearchChange(event.target.value)}
            placeholder="Search email, message, or IP"
            className="h-8 pl-9 text-sm"
          />
        </div>
      </div>

      {pageError && <StatusMessage tone="error">{pageError}</StatusMessage>}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading abuse reports...
          </div>
        ) : reports.items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-sm font-medium text-foreground">No reports found</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted contact and abuse reports will appear here.
            </p>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Email</TableHead>
                <TableHead className="h-8">Message</TableHead>
                <TableHead className="h-8">Status</TableHead>
                <TableHead className="h-8">IP</TableHead>
                <TableHead className="h-8">Created</TableHead>
                <TableHead className="h-8 w-[96px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.items.map((report) => (
                <TableRow key={report.id} className="h-10">
                  <TableCell className="min-w-[180px] py-1.5">
                    {report.email ? (
                      <span className="font-mono text-xs">{report.email}</span>
                    ) : (
                      <span className="text-muted-foreground">Anonymous</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="max-w-[420px] truncate text-xs">{preview(report.message)}</div>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <select
                      value={report.status}
                      onChange={(e) =>
                        void handleStatusChange(report, e.target.value as AbuseReportStatus)
                      }
                      disabled={updateStatusMutation.isPending}
                      className="h-6 rounded border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-1.5 font-mono text-xs text-muted-foreground">
                    {report.ipAddress ?? "-"}
                  </TableCell>
                  <TableCell className="py-1.5 text-muted-foreground">
                    {formatDateTime(report.createdAt)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`View abuse report ${report.id}`}
                        onClick={() => openReport(report)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Delete abuse report ${report.id}`}
                        onClick={() => void handleDelete(report)}
                        disabled={deleteReportMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination
        page={table.page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPrev={table.handlePrev}
        onNext={() => table.handleNext(totalPages)}
      />

      <Dialog
        open={Boolean(selectedReportSummary)}
        onOpenChange={(open) => !open && setSelectedReportSummary(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Abuse report #{selectedReport?.id}</DialogTitle>
            <DialogDescription>
              {selectedReport ? formatDateTime(selectedReport.createdAt) : "Report details"}
            </DialogDescription>
          </DialogHeader>

          {reportQuery.isError && (
            <StatusMessage tone="error" className="px-3 py-2">
              {errorMessage(reportQuery.error, "Could not load abuse report")}
            </StatusMessage>
          )}

          {reportQuery.isPending && selectedReportSummary ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading report...</div>
          ) : selectedReport ? (
            <div className="space-y-4">
              <dl className="grid gap-2 text-sm">
                <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all font-mono">{selectedReport.email ?? "Anonymous"}</dd>
                </div>
                <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">IP</dt>
                  <dd className="break-all font-mono">{selectedReport.ipAddress ?? "-"}</dd>
                </div>
                <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <select
                      value={selectedReport.status}
                      onChange={(e) =>
                        void handleStatusChange(selectedReport, e.target.value as AbuseReportStatus)
                      }
                      disabled={updateStatusMutation.isPending}
                      className="h-7 rounded border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </dd>
                </div>
                <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">User agent</dt>
                  <dd className="break-all font-mono text-xs">{selectedReport.userAgent ?? "-"}</dd>
                </div>
              </dl>
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-6 whitespace-pre-line">
                {selectedReport.message}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
