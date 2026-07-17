import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Power, RefreshCw, RotateCcw } from "lucide-react";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { getCleanupStats, getSettings, runCleanup, updateSettings } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";

export function AdminOperationsPage() {
  usePageTitle("Admin Operations - Swift Inbox");

  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cleanupStatsQuery = useQuery({
    queryKey: queryKeys.cleanupStats,
    queryFn: getCleanupStats,
  });

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
  });

  const runCleanupMutation = useMutation({
    mutationFn: runCleanup,
    onSuccess: (result) => {
      setSuccess(
        `Deleted ${result.deletedMailboxes} expired mailboxes at ${formatDateTime(result.ranAt)}.`,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (nextSettings) => {
      queryClient.setQueryData(queryKeys.settings, nextSettings);
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSettings });
    },
  });

  const handleRefresh = async () => {
    setError(null);
    await Promise.all([cleanupStatsQuery.refetch(), settingsQuery.refetch()]);
  };

  const handleRunCleanup = async () => {
    const confirmed = window.confirm("Run cleanup for expired mailboxes now?");

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await runCleanupMutation.mutateAsync();
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not run cleanup"));
    }
  };

  const handleToggleMaintenance = async () => {
    if (!settingsQuery.data) return;

    const nextMaintenanceMode = !settingsQuery.data.maintenanceMode;
    const confirmed = window.confirm(
      nextMaintenanceMode
        ? "Enable maintenance mode and pause public mailbox actions?"
        : "Disable maintenance mode and resume public mailbox actions?",
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await updateSettingsMutation.mutateAsync({
        maintenanceMode: nextMaintenanceMode,
      });
      setSuccess(nextMaintenanceMode ? "Maintenance mode enabled." : "Maintenance mode disabled.");
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not update maintenance mode"));
    }
  };

  const stats = cleanupStatsQuery.data;
  const isLoading = cleanupStatsQuery.isPending;
  const isSettingsLoading = settingsQuery.isPending;
  const isRunning = runCleanupMutation.isPending;
  const isMaintenanceMode = Boolean(settingsQuery.data?.maintenanceMode);
  const isTogglingMaintenance = updateSettingsMutation.isPending;
  const pageError =
    error ??
    (cleanupStatsQuery.isError
      ? errorMessage(cleanupStatsQuery.error, "Could not load cleanup stats")
      : settingsQuery.isError
        ? errorMessage(settingsQuery.error, "Could not load settings")
        : null);

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
              {settingsQuery.data?.maintenanceMessage && (
                <span className="mt-1 block">{settingsQuery.data.maintenanceMessage}</span>
              )}
            </span>
          </span>
        </StatusMessage>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Expired mailboxes</div>
          <div className="mt-0.5 text-xl font-semibold">
            {isLoading ? "-" : (stats?.expiredMailboxes ?? 0)}
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
