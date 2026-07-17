import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Edit2, Plus, RefreshCw, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePageTitle } from "@/hooks/use-page-title";
import { createDomain, deleteDomain, getDomains, updateDomain } from "@/lib/api";
import { formatDate } from "@/lib/date";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { Domain, DomainInput } from "@/types/domain";

const EMPTY_DOMAINS: Domain[] = [];

type DomainFormState = {
  name: string;
  label: string;
  isActive: boolean;
  isDefault: boolean;
};

const emptyForm: DomainFormState = {
  name: "",
  label: "",
  isActive: true,
  isDefault: false,
};

const domainPattern = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

function toForm(domain: Domain): DomainFormState {
  return {
    name: domain.name,
    label: domain.label ?? "",
    isActive: domain.isActive,
    isDefault: domain.isDefault,
  };
}

function toInput(form: DomainFormState): DomainInput {
  return {
    name: form.name.trim().toLowerCase(),
    label: form.label.trim() || null,
    isActive: form.isActive,
    isDefault: form.isDefault,
  };
}

export function AdminDomainsPage() {
  usePageTitle("Admin Domains - Swift Inbox");

  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [form, setForm] = useState<DomainFormState>(emptyForm);

  const domainsQuery = useQuery({
    queryKey: queryKeys.domains,
    queryFn: getDomains,
  });

  const refreshDomains = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.domains,
    });

  const createDomainMutation = useMutation({
    mutationFn: createDomain,
    onSuccess: () => {
      void refreshDomains();
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: DomainInput }) => updateDomain(id, input),
    onSuccess: () => {
      void refreshDomains();
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      void refreshDomains();
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const domains = domainsQuery.data ?? EMPTY_DOMAINS;
  const isLoading = domainsQuery.isPending;
  const isSubmitting = createDomainMutation.isPending || updateDomainMutation.isPending;
  const pageError =
    error ??
    (domainsQuery.isError ? errorMessage(domainsQuery.error, "Could not load domains") : null);

  const stats = useMemo(() => {
    const active = domains.filter((domain) => domain.isActive).length;
    const defaultDomain = domains.find((domain) => domain.isDefault)?.name ?? "None";

    return {
      total: domains.length,
      active,
      defaultDomain,
    };
  }, [domains]);

  const openCreateDialog = () => {
    setEditingDomain(null);
    setForm(emptyForm);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (domain: Domain) => {
    setEditingDomain(domain);
    setForm(toForm(domain));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const input = toInput(form);

    if (!input.name) {
      setFormError("Domain name is required");
      return;
    }

    if (!domainPattern.test(input.name)) {
      setFormError("Enter a valid domain, for example mailbox.one");
      return;
    }

    setFormError(null);

    try {
      if (editingDomain) {
        await updateDomainMutation.mutateAsync({ id: editingDomain.id, input });
      } else {
        await createDomainMutation.mutateAsync(input);
      }

      setIsDialogOpen(false);
    } catch (nextError) {
      setFormError(errorMessage(nextError, "Could not save domain"));
    }
  };

  const handleDelete = async (domain: Domain) => {
    const confirmed = window.confirm(
      `Delete ${domain.name}? This will only work if no mailboxes are using this domain.`,
    );

    if (!confirmed) return;

    setError(null);

    try {
      await deleteDomainMutation.mutateAsync(domain.id);
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not delete domain"));
    }
  };

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Domains"
        description="Manage the domains available for temporary inbox creation."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void domainsQuery.refetch()}
              disabled={domainsQuery.isFetching}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add domain
            </Button>
          </>
        }
      />

      <AdminStatCards
        items={[
          { label: "Total domains", value: stats.total },
          { label: "Active domains", value: stats.active },
          {
            label: "Default domain",
            value: stats.defaultDomain,
            className: "mt-0.5 truncate font-mono text-base font-semibold",
          },
        ]}
      />

      {pageError && <StatusMessage tone="error">{pageError}</StatusMessage>}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading domains...
          </div>
        ) : domains.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-sm font-medium text-foreground">No domains yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first domain to start creating inboxes.
            </p>
            <Button size="sm" className="mt-3" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add domain
            </Button>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Domain</TableHead>
                <TableHead className="h-8">Label</TableHead>
                <TableHead className="h-8">Status</TableHead>
                <TableHead className="h-8">Default</TableHead>
                <TableHead className="h-8">Created</TableHead>
                <TableHead className="h-8 w-[96px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id} className="h-10">
                  <TableCell className="py-1.5">
                    <div className="min-w-[180px] font-mono text-xs font-medium">{domain.name}</div>
                  </TableCell>
                  <TableCell className="py-1.5 text-muted-foreground">
                    {domain.label ?? "-"}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Badge
                      variant="outline"
                      className={
                        domain.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-muted bg-muted text-muted-foreground"
                      }
                    >
                      {domain.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5">{domain.isDefault ? "Yes" : "No"}</TableCell>
                  <TableCell className="py-1.5 text-muted-foreground">
                    {formatDate(domain.createdAt)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Edit ${domain.name}`}
                        onClick={() => openEditDialog(domain)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Delete ${domain.name}`}
                        onClick={() => void handleDelete(domain)}
                        disabled={deleteDomainMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDomain ? "Edit domain" : "Add domain"}</DialogTitle>
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
