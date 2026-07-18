import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { SettingsSectionProps } from "./types";

export function MaintenanceSection({ settings, setSettings }: SettingsSectionProps) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-semibold">Maintenance</h2>
        <p className="text-xs text-muted-foreground">
          Temporarily pause public write actions and show a notice.
        </p>
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
          Shown on Home and returned by blocked public API actions while maintenance mode is active.{" "}
          {settings.maintenanceMessage.trim().length}/240
        </p>
      </div>
    </section>
  );
}
