import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { getCleanupStats, getSettings, runCleanup, updateSettings } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";

export function useAdminOperations() {
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
        `Permanently deleted ${result.deletedMailboxes} expired mailboxes (past ${result.retentionDays}-day retention) at ${formatDateTime(result.ranAt)}.`,
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

  const pageError =
    error ??
    (cleanupStatsQuery.isError
      ? errorMessage(cleanupStatsQuery.error, "Could not load cleanup stats")
      : settingsQuery.isError
        ? errorMessage(settingsQuery.error, "Could not load settings")
        : null);

  return {
    stats: cleanupStatsQuery.data,
    isLoading: cleanupStatsQuery.isPending,
    isSettingsLoading: settingsQuery.isPending,
    isRunning: runCleanupMutation.isPending,
    isMaintenanceMode: Boolean(settingsQuery.data?.maintenanceMode),
    isTogglingMaintenance: updateSettingsMutation.isPending,
    maintenanceMessage: settingsQuery.data?.maintenanceMessage,
    pageError,
    success,
    handleRefresh,
    handleRunCleanup,
    handleToggleMaintenance,
  };
}
