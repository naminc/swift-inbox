import { Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { AbuseReportDialog } from "@/components/admin/abuse/AbuseReportDialog";
import { AbuseStatusSelect } from "@/components/admin/abuse/AbuseStatusSelect";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { previewMessage, useAdminAbuse } from "@/hooks/use-admin-abuse";
import { useAdminTableState } from "@/hooks/use-admin-table-state";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDateTime } from "@/lib/date";

const PAGE_LIMIT = 10;

export function AdminAbusePage() {
  usePageTitle("Admin Abuse Reports - Swift Inbox");

  const table = useAdminTableState({ limit: PAGE_LIMIT });
  const {
    reports,
    isLoading,
    isFetching,
    refetch,
    pageError,
    totalPages,
    selectedReport,
    isReportOpen,
    isReportLoading,
    reportError,
    isUpdatingStatus,
    isDeleting,
    openReport,
    closeReport,
    handleStatusChange,
    handleDelete,
  } = useAdminAbuse(table);

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Abuse Reports"
        description="Review contact messages and abuse reports submitted from the public site."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
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
                    <div className="max-w-[420px] truncate text-xs">
                      {previewMessage(report.message)}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <AbuseStatusSelect
                      value={report.status}
                      onChange={(status) => void handleStatusChange(report, status)}
                      disabled={isUpdatingStatus}
                      className="h-6 rounded border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                    />
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
                        disabled={isDeleting}
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

      <AbuseReportDialog
        open={isReportOpen}
        report={selectedReport}
        error={reportError}
        isLoading={isReportLoading && isReportOpen}
        isUpdatingStatus={isUpdatingStatus}
        onStatusChange={(report, status) => void handleStatusChange(report, status)}
        onClose={closeReport}
      />
    </div>
  );
}
