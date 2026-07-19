import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getSettings, updateSettings } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { validateSettingsForm } from "@/lib/validation";
import type { AppSettings } from "@/types/settings";

export const DEFAULT_SETTINGS_FORM: AppSettings = {
  siteName: "",
  siteTitle: "",
  heroHeading: "",
  heroSubheading: "",
  metaKeywords: "",
  metaDescription: "",
  metaAuthor: "",
  supportEmail: "",
  defaultMailboxExpiryMinutes: 60,
  maxMailboxMessages: 100,
  randomLocalPartMinLength: 6,
  randomLocalPartMaxLength: 10,
  expiredMailboxRetentionDays: 7,
  allowPublicMailboxCreation: true,
  maintenanceMode: false,
  maintenanceMessage:
    "Swift Inbox is under maintenance. Existing inboxes can be viewed, but new addresses and mailbox changes are paused.",
  reservedLocalParts: [],
};

function normalizeReservedLocalParts(items: string[]): string[] {
  return Array.from(
    new Set(items.map((item) => item.trim().toLowerCase()).filter((item) => item.length > 0)),
  );
}

export function normalizeSettingsForm(form: AppSettings): AppSettings {
  return {
    ...form,
    siteName: form.siteName.trim(),
    siteTitle: form.siteTitle.trim(),
    heroHeading: form.heroHeading.trim(),
    heroSubheading: form.heroSubheading.trim(),
    metaKeywords: form.metaKeywords.trim(),
    metaDescription: form.metaDescription.trim(),
    metaAuthor: form.metaAuthor.trim(),
    supportEmail: form.supportEmail.trim(),
    defaultMailboxExpiryMinutes: Number(form.defaultMailboxExpiryMinutes),
    maxMailboxMessages: Number(form.maxMailboxMessages),
    randomLocalPartMinLength: Number(form.randomLocalPartMinLength),
    randomLocalPartMaxLength: Number(form.randomLocalPartMaxLength),
    expiredMailboxRetentionDays: Number(form.expiredMailboxRetentionDays),
    maintenanceMessage: form.maintenanceMessage.trim(),
    reservedLocalParts: normalizeReservedLocalParts(form.reservedLocalParts),
  };
}

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS_FORM);
  const [savedSettings, setSavedSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (nextSettings) => {
      queryClient.setQueryData(queryKeys.settings, nextSettings);
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      setSuccess("Settings saved");
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSettings });
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setSettings(settingsQuery.data);
    setSavedSettings(settingsQuery.data);
  }, [settingsQuery.data]);

  const isDirty = useMemo(() => {
    if (!savedSettings) return false;

    return JSON.stringify(normalizeSettingsForm(settings)) !== JSON.stringify(savedSettings);
  }, [savedSettings, settings]);

  const handleRefresh = async () => {
    setError(null);
    setSuccess(null);
    await settingsQuery.refetch();
  };

  const handleSave = async () => {
    const nextSettings = normalizeSettingsForm(settings);
    const validationError = validateSettingsForm(nextSettings);

    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await updateSettingsMutation.mutateAsync(nextSettings);
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not save settings"));
    }
  };

  const isLoading = settingsQuery.isPending;
  const isSaving = updateSettingsMutation.isPending;
  const pageError =
    error ??
    (settingsQuery.isError ? errorMessage(settingsQuery.error, "Could not load settings") : null);

  return {
    settings,
    setSettings,
    isLoading,
    isSaving,
    isDirty,
    pageError,
    success,
    handleSave,
    handleRefresh,
  };
}
