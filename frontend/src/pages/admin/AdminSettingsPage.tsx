import { useState } from "react";
import { RefreshCw, Save } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { IdentitySection } from "@/components/admin/settings/IdentitySection";
import { MailboxSection } from "@/components/admin/settings/MailboxSection";
import { MaintenanceSection } from "@/components/admin/settings/MaintenanceSection";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { usePageTitle } from "@/hooks/use-page-title";

type SettingsTab = "identity" | "mailbox" | "maintenance";

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "identity", label: "Public identity" },
  { id: "mailbox", label: "Mailbox behavior" },
  { id: "maintenance", label: "Maintenance" },
];

export function AdminSettingsPage() {
  usePageTitle("Admin Settings - Swift Inbox");

  const [activeTab, setActiveTab] = useState<SettingsTab>("identity");
  const {
    settings,
    setSettings,
    isLoading,
    isSaving,
    isDirty,
    pageError,
    success,
    handleSave,
    handleRefresh,
  } = useAdminSettings();

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
            <div className="flex flex-wrap gap-1 rounded-md border border-border bg-muted/40 p-1">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "identity" && (
              <IdentitySection settings={settings} setSettings={setSettings} />
            )}

            {activeTab === "mailbox" && (
              <MailboxSection settings={settings} setSettings={setSettings} />
            )}

            {activeTab === "maintenance" && (
              <MaintenanceSection settings={settings} setSettings={setSettings} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
