import { AlertTriangle, Power, RefreshCw, RotateCcw } from "lucide-react";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { useAdminOperations } from "@/hooks/use-admin-operations";
import { usePageTitle } from "@/hooks/use-page-title";

export function AdminOperationsPage() {
  usePageTitle("Admin Operations - Swift Inbox");

  const {
    stats,
    isLoading,
    isSettingsLoading,
    isRunning,
    isMaintenanceMode,
    isTogglingMaintenance,
    maintenanceMessage,
    pageError,
    success,
    handleRefresh,
    handleRunCleanup,
    handleToggleMaintenance,
  } = useAdminOperations();

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Operations</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            Monitor expired inboxes and run mailbox cleanup manually when needed.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant={isMaintenanceMode ? "default" : "outline"}
            size="sm"
            onClick={() => void handleToggleMaintenance()}
            disabled={isSettingsLoading || isTogglingMaintenance}
          >
            <Power className="h-4 w-4" />
            {isTogglingMaintenance
              ? "Updating..."
              : isMaintenanceMode
                ? "Disable maintenance"
                : "Enable maintenance"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isLoading || isRunning}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunCleanup} disabled={isLoading || isRunning}>
            <RotateCcw className="h-4 w-4" />
            {isRunning ? "Running..." : "Run cleanup"}
          </Button>
        </div>
      </div>

      {pageError && <StatusMessage tone="error">{pageError}</StatusMessage>}

      {success && <StatusMessage tone="success">{success}</StatusMessage>}

      {isMaintenanceMode && (
        <StatusMessage tone="warning">
          <span className="inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Maintenance mode is active. Public mailbox creation, renewal, inbound mail, and
              contact submissions are paused.
              {maintenanceMessage && <span className="mt-1 block">{maintenanceMessage}</span>}
            </span>
          </span>
        </StatusMessage>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Expired mailboxes</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.expiredMailboxes ?? 0)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Purgeable mailboxes</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.purgeableMailboxes ?? 0)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Retention days</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.retentionDays ?? 0)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Total mailboxes</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.totalMailboxes ?? 0)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Total messages</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.totalMessages ?? 0)}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-3">
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading cleanup status...
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <span className="text-muted-foreground">Background cleanup</span>
              <span className="font-medium text-foreground">Enabled</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium text-foreground">
                {stats?.nextRunHint ?? "Not available"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
