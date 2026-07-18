import type { Dispatch, SetStateAction } from "react";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { DomainFormState } from "@/hooks/use-admin-domains";

type DomainFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: DomainFormState;
  setForm: Dispatch<SetStateAction<DomainFormState>>;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function DomainFormDialog({
  open,
  onOpenChange,
  isEditing,
  form,
  setForm,
  formError,
  isSubmitting,
  onSubmit,
}: DomainFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit domain" : "Add domain"}</DialogTitle>
          <DialogDescription>
            Domain changes affect the addresses users can generate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {formError && (
            <StatusMessage tone="error" className="px-3 py-2">
              {formError}
            </StatusMessage>
          )}

          <div className="grid gap-2">
            <Label htmlFor="domain-name">Domain</Label>
            <Input
              id="domain-name"
              value={form.name}
              placeholder="mailbox.one"
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="domain-label">Label</Label>
            <Input
              id="domain-label"
              value={form.label}
              placeholder="Popular"
              onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-3">
            <div>
              <Label htmlFor="domain-active">Active</Label>
              <p className="mt-1 text-xs text-muted-foreground">Show this domain to users.</p>
            </div>
            <Switch
              id="domain-active"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-3">
            <div>
              <Label htmlFor="domain-default">Default</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Use as the first selected domain.
              </p>
            </div>
            <Switch
              id="domain-default"
              checked={form.isDefault}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isDefault: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
