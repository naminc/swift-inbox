import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminTableState } from "@/hooks/use-admin-table-state";
import { usePageTitle } from "@/hooks/use-page-title";
import { deleteMailbox, getDomains, getMailboxMessages, listMailboxes } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/date";
import { readableMessageBody } from "@/lib/email-content";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { MailboxListItem, MailboxListResponse } from "@/types/mailbox";

const PAGE_LIMIT = 10;

const EMPTY_MAILBOXES: MailboxListResponse = {
  items: [],
  meta: {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  },
};

export function AdminMailboxesPage() {
  usePageTitle("Admin Mailboxes - Swift Inbox");

  const queryClient = useQueryClient();
  const table = useAdminTableState({ limit: PAGE_LIMIT, withDomainFilter: true });
  const [error, setError] = useState<string | null>(null);
  const [selectedMailbox, setSelectedMailbox] = useState<MailboxListItem | null>(null);

  const domainsQuery = useQuery({
    queryKey: queryKeys.domains,
    queryFn: getDomains,
  });

  const domains = domainsQuery.data ?? [];

  const mailboxesQuery = useQuery({
    queryKey: queryKeys.adminMailboxes(table.params),
    queryFn: () => listMailboxes(table.params),
    placeholderData: keepPreviousData,
  });

  const selectedAddress = selectedMailbox?.address ?? "";
  const messagesQuery = useQuery({
    queryKey: queryKeys.mailboxMessages(selectedAddress),
    queryFn: () => getMailboxMessages(selectedAddress),
    enabled: Boolean(selectedAddress),
  });

  const deleteMailboxMutation = useMutation({
    mutationFn: deleteMailbox,
    onSuccess: (_data, address) => {
      queryClient.removeQueries({ queryKey: queryKeys.mailbox(address) });
      queryClient.removeQueries({ queryKey: queryKeys.mailboxMessages(address) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const mailboxes = mailboxesQuery.data ?? EMPTY_MAILBOXES;
  const messages = messagesQuery.data ?? [];
  const isLoading = mailboxesQuery.isPending;
  const pageError =
    error ??
    (mailboxesQuery.isError
      ? errorMessage(mailboxesQuery.error, "Could not load mailboxes")
      : null);
  const messagesError = messagesQuery.isError
    ? errorMessage(messagesQuery.error, "Could not load messages")
    : null;
  const totalPages = mailboxes.meta.totalPages || 1;

  const openMessages = (mailbox: MailboxListItem) => {
    setSelectedMailbox(mailbox);
    void queryClient.invalidateQueries({
      queryKey: queryKeys.mailboxMessages(mailbox.address),
    });
  };

  const handleDelete = async (mailbox: MailboxListItem) => {
    const confirmed = window.confirm(
      `Delete ${mailbox.address}? Messages in this inbox will be removed.`,
    );

    if (!confirmed) return;

    setError(null);

    try {
      await deleteMailboxMutation.mutateAsync(mailbox.address);

      if (selectedMailbox?.address === mailbox.address) {
        setSelectedMailbox(null);
      }
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not delete mailbox"));
    }
  };

  return (
    <div className="min-w-0 space-y-3">
      <AdminPageHeader
        title="Mailboxes"
        description="Review generated inboxes, inspect recent messages, and remove stale addresses."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void mailboxesQuery.refetch()}
            disabled={mailboxesQuery.isFetching}
          >
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
                        disabled={deleteMailboxMutation.isPending}
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

      <Dialog
        open={Boolean(selectedMailbox)}
        onOpenChange={(open) => !open && setSelectedMailbox(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mailbox messages</DialogTitle>
            <DialogDescription className="break-all">
              {selectedMailbox?.address ?? "Selected mailbox"}
            </DialogDescription>
          </DialogHeader>

          {messagesError && (
            <StatusMessage tone="error" className="px-3 py-2">
              {messagesError}
            </StatusMessage>
          )}

          <div className="max-h-[460px] overflow-y-auto rounded-md border border-border">
            {selectedMailbox && messagesQuery.isPending ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                This mailbox has no messages.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border-b border-border p-3 last:border-b-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {message.subject ?? "(No subject)"}
                      </div>
                      <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {message.fromAddress}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline">{message.isRead ? "Read" : "Unread"}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(message.receivedAt)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 break-words text-muted-foreground">
                    {readableMessageBody(message) || "(No readable body)"}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
