import { Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { MailboxMessagesDialog } from "@/components/admin/mailboxes/MailboxMessagesDialog";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isMailboxExpired, useAdminMailboxes } from "@/hooks/use-admin-mailboxes";
import { useAdminTableState } from "@/hooks/use-admin-table-state";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDate } from "@/lib/date";

const PAGE_LIMIT = 10;

export function AdminMailboxesPage() {
  usePageTitle("Admin Mailboxes - Swift Inbox");

  const table = useAdminTableState({ limit: PAGE_LIMIT, withDomainFilter: true });
  const {
    domains,
    mailboxes,
    isLoading,
    isFetching,
    refetch,
    pageError,
    totalPages,
    selectedMailbox,
    setSelectedMailbox,
    messages,
    messagesError,
    isMessagesLoading,
    openMessages,
    handleDelete,
    isDeleting,
  } = useAdminMailboxes(table);

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Mailboxes"
        description="Review generated inboxes, inspect recent messages, and remove stale addresses."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <AdminStatCards
        items={[
          { label: "Total mailboxes", value: mailboxes.meta.total },
          { label: "Current page", value: mailboxes.meta.page },
          { label: "Total pages", value: totalPages },
        ]}
      />

      <div className="grid gap-2 rounded-md border border-border bg-card p-2 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={table.search}
            onChange={(event) => table.handleSearchChange(event.target.value)}
            placeholder="Search address or local part"
            className="h-8 pl-9 text-sm"
          />
        </div>
        <select
          value={table.domainId}
          onChange={(event) => table.handleDomainChange(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All domains</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
              {!domain.isActive ? " (inactive)" : ""}
            </option>
          ))}
        </select>
      </div>

      {pageError && <StatusMessage tone="error">{pageError}</StatusMessage>}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading mailboxes...
          </div>
        ) : mailboxes.items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-sm font-medium text-foreground">No mailboxes found</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or generate a mailbox from the public Home page.
            </p>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Address</TableHead>
                <TableHead className="h-8">Domain</TableHead>
                <TableHead className="h-8">Messages</TableHead>
                <TableHead className="h-8">Status</TableHead>
                <TableHead className="h-8">Expires</TableHead>
                <TableHead className="h-8">Created</TableHead>
                <TableHead className="h-8 w-[96px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.items.map((mailbox) => (
                <TableRow key={mailbox.id} className="h-10">
                  <TableCell className="py-1.5">
                    <div className="min-w-[200px] truncate font-mono text-xs font-medium">
                      {mailbox.address}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 font-mono text-xs text-muted-foreground">
                    {mailbox.domain.name}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Badge variant="outline">{mailbox._count.messages}</Badge>
                  </TableCell>
                  <TableCell className="py-1.5">
                    {isMailboxExpired(mailbox.expiresAt) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5 text-muted-foreground">
                    {formatDate(mailbox.expiresAt)}
                  </TableCell>
                  <TableCell className="py-1.5 text-muted-foreground">
                    {formatDate(mailbox.createdAt)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`View messages for ${mailbox.address}`}
                        onClick={() => openMessages(mailbox)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Delete ${mailbox.address}`}
                        onClick={() => void handleDelete(mailbox)}
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

      <DataTablePagination
        page={table.page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPrev={table.handlePrev}
        onNext={() => table.handleNext(totalPages)}
      />

      <MailboxMessagesDialog
        mailbox={selectedMailbox}
        messages={messages}
        error={messagesError}
        isLoading={isMessagesLoading}
        onClose={() => setSelectedMailbox(null)}
      />
    </div>
  );
}
