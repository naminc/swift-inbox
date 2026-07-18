import { Edit2, Plus, RefreshCw, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { DomainFormDialog } from "@/components/admin/domains/DomainFormDialog";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDomains } from "@/hooks/use-admin-domains";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDate } from "@/lib/date";

export function AdminDomainsPage() {
  usePageTitle("Admin Domains - Swift Inbox");

  const {
    domains,
    isLoading,
    isFetching,
    refetch,
    isSubmitting,
    isDeleting,
    pageError,
    stats,
    form,
    setForm,
    formError,
    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
  } = useAdminDomains();

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
              onClick={() => void refetch()}
              disabled={isFetching}
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
                        disabled={isDeleting}
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

      <DomainFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
}
