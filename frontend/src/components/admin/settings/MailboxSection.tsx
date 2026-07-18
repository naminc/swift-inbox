import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { SettingsSectionProps } from "./types";

export function MailboxSection({ settings, setSettings }: SettingsSectionProps) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-semibold">Mailbox behavior</h2>
        <p className="text-xs text-muted-foreground">
          Defaults for generated inboxes and message limits.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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

        <div className="grid gap-2">
          <Label htmlFor="expired-retention-days">Expired mailbox retention days</Label>
          <Input
            id="expired-retention-days"
            type="number"
            min={1}
            max={365}
            value={settings.expiredMailboxRetentionDays}
            className="h-8 text-sm"
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                expiredMailboxRetentionDays: Number(event.target.value),
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Expired inboxes are hidden from public users but kept for admin review before permanent
            cleanup.
          </p>
        </div>
      </div>

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
    </section>
  );
}
