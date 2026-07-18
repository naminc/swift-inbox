import { StatusMessage } from "@/components/feedback/StatusMessage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/date";
import type { AbuseReport, AbuseReportStatus } from "@/types/abuse";

import { AbuseStatusSelect } from "./AbuseStatusSelect";

type AbuseReportDialogProps = {
  open: boolean;
  report: AbuseReport | null;
  error: string | null;
  isLoading: boolean;
  isUpdatingStatus: boolean;
  onStatusChange: (report: AbuseReport, status: AbuseReportStatus) => void;
  onClose: () => void;
};

export function AbuseReportDialog({
  open,
  report,
  error,
  isLoading,
  isUpdatingStatus,
  onStatusChange,
  onClose,
}: AbuseReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Abuse report #{report?.id}</DialogTitle>
          <DialogDescription>
            {report ? formatDateTime(report.createdAt) : "Report details"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <StatusMessage tone="error" className="px-3 py-2">
            {error}
          </StatusMessage>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading report...</div>
        ) : report ? (
          <div className="space-y-4">
            <dl className="grid gap-2 text-sm">
              <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all font-mono">{report.email ?? "Anonymous"}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">IP</dt>
                <dd className="break-all font-mono">{report.ipAddress ?? "-"}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <AbuseStatusSelect
                    value={report.status}
                    onChange={(status) => onStatusChange(report, status)}
                    disabled={isUpdatingStatus}
                    className="h-7 rounded border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">User agent</dt>
                <dd className="break-all font-mono text-xs">{report.userAgent ?? "-"}</dd>
              </div>
            </dl>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-6 whitespace-pre-line">
              {report.message}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
