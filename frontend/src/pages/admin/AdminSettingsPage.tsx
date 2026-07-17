import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/hooks/use-page-title";
import { getSettings, updateSettings } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { AppSettings } from "@/types/settings";

const DEFAULT_FORM: AppSettings = {
  siteName: "",
  supportEmail: "",
  defaultMailboxExpiryMinutes: 60,
  maxMailboxMessages: 100,
  randomLocalPartMinLength: 6,
  randomLocalPartMaxLength: 10,
  allowPublicMailboxCreation: true,
  maintenanceMode: false,
  maintenanceMessage:
    "Swift Inbox is under maintenance. Existing inboxes can be viewed, but new addresses and mailbox changes are paused.",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeForm(form: AppSettings): AppSettings {
  return {
    ...form,
    siteName: form.siteName.trim(),
    supportEmail: form.supportEmail.trim(),
    defaultMailboxExpiryMinutes: Number(form.defaultMailboxExpiryMinutes),
    maxMailboxMessages: Number(form.maxMailboxMessages),
    randomLocalPartMinLength: Number(form.randomLocalPartMinLength),
    randomLocalPartMaxLength: Number(form.randomLocalPartMaxLength),
    maintenanceMessage: form.maintenanceMessage.trim(),
  };
}

export function AdminSettingsPage() {
  usePageTitle("Admin Settings - Swift Inbox");

  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_FORM);
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

    return JSON.stringify(normalizeForm(settings)) !== JSON.stringify(savedSettings);
  }, [savedSettings, settings]);

  const validate = () => {
    const nextSettings = normalizeForm(settings);

    if (!nextSettings.siteName) {
      return "Site name is required";
    }

    if (!emailPattern.test(nextSettings.supportEmail)) {
      return "Support email must be valid";
    }

    if (
      !Number.isInteger(nextSettings.defaultMailboxExpiryMinutes) ||
      nextSettings.defaultMailboxExpiryMinutes < 1
    ) {
      return "Mailbox expiry must be a positive integer";
    }

    if (!Number.isInteger(nextSettings.maxMailboxMessages) || nextSettings.maxMailboxMessages < 1) {
      return "Max mailbox messages must be a positive integer";
    }

    if (
      !Number.isInteger(nextSettings.randomLocalPartMinLength) ||
      nextSettings.randomLocalPartMinLength < 3
    ) {
      return "Random local part min length must be at least 3";
    }

    if (
      !Number.isInteger(nextSettings.randomLocalPartMaxLength) ||
      nextSettings.randomLocalPartMaxLength > 32
    ) {
      return "Random local part max length must be at most 32";
    }

    if (nextSettings.randomLocalPartMinLength > nextSettings.randomLocalPartMaxLength) {
      return "Random local part min length must be less than or equal to max length";
    }

    if (!nextSettings.maintenanceMessage) {
      return "Maintenance message is required";
    }

    if (nextSettings.maintenanceMessage.length > 240) {
      return "Maintenance message must be 240 characters or fewer";
    }

    return null;
  };

  const handleRefresh = async () => {
    setError(null);
    setSuccess(null);
    await settingsQuery.refetch();
  };

  const handleSave = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await updateSettingsMutation.mutateAsync(normalizeForm(settings));
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not save settings"));
    }
  };

  const isLoading = settingsQuery.isPending;
  const isSaving = updateSettingsMutation.isPending;
  const pageError =
    error ??
    (settingsQuery.isError ? errorMessage(settingsQuery.error, "Could not load settings") : null);

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Settings"
        description="Configure public app behavior and mailbox defaults."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isLoading || isSaving}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading || isSaving || !isDirty}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      />

      {pageError && <StatusMessage tone="error">{pageError}</StatusMessage>}

      {success && <StatusMessage tone="success">{success}</StatusMessage>}

      <div className="rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading settings...
          </div>
        ) : (
          <div className="grid gap-4 p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="site-name">Site name</Label>
                <Input
                  id="site-name"
                  value={settings.siteName}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, siteName: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-email">Support email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={settings.supportEmail}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, supportEmail: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mailbox-expiry">Default mailbox expiry minutes</Label>
                <Input
                  id="mailbox-expiry"
                  type="number"
                  min={1}
                  max={43_200}
                  value={settings.defaultMailboxExpiryMinutes}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultMailboxExpiryMinutes: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max-messages">Max mailbox messages</Label>
                <Input
                  id="max-messages"
                  type="number"
                  min={1}
                  max={10_000}
                  value={settings.maxMailboxMessages}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxMailboxMessages: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="random-local-min">Random local part min length</Label>
                <Input
                  id="random-local-min"
                  type="number"
                  min={3}
                  max={32}
                  value={settings.randomLocalPartMinLength}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      randomLocalPartMinLength: Number(event.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Controls generated inbox names like swift8421 or noriq7.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="random-local-max">Random local part max length</Label>
                <Input
                  id="random-local-max"
                  type="number"
                  min={3}
                  max={32}
                  value={settings.randomLocalPartMaxLength}
                  className="h-8 text-sm"
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      randomLocalPartMaxLength: Number(event.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Keep this at 32 or below for provider-friendly addresses.
                </p>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5">
                <div>
                  <Label htmlFor="allow-public-mailbox">Public mailbox creation</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Allow visitors to generate temporary inboxes.
                  </p>
                </div>
                <Switch
                  id="allow-public-mailbox"
                  checked={settings.allowPublicMailboxCreation}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, allowPublicMailboxCreation: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance mode</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pause public mailbox creation, renewal, inbound mail, and contact submissions.
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, maintenanceMode: checked }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maintenance-message">Maintenance message</Label>
              <Textarea
                id="maintenance-message"
                value={settings.maintenanceMessage}
                maxLength={240}
                className="min-h-20 resize-none text-sm"
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    maintenanceMessage: event.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Shown on Home and returned by blocked public API actions while maintenance mode is
                active. {settings.maintenanceMessage.trim().length}/240
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
