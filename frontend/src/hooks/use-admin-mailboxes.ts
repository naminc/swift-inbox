import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { deleteMailbox, getAdminMailboxMessages, getDomains, listMailboxes } from "@/lib/api";
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

export function isMailboxExpired(expiresAt: string | null) {
  return Boolean(expiresAt) && new Date(expiresAt as string).getTime() <= Date.now();
}

export function useAdminMailboxes(table: { params: Parameters<typeof listMailboxes>[0] }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selectedMailbox, setSelectedMailbox] = useState<MailboxListItem | null>(null);

  const domainsQuery = useQuery({
    queryKey: queryKeys.domains,
    queryFn: getDomains,
  });

  const mailboxesQuery = useQuery({
    queryKey: queryKeys.adminMailboxes(table.params),
    queryFn: () => listMailboxes(table.params),
    placeholderData: keepPreviousData,
  });

  const selectedAddress = selectedMailbox?.address ?? "";
  const messagesQuery = useQuery({
    queryKey: queryKeys.adminMailboxMessages(selectedAddress),
    queryFn: () => getAdminMailboxMessages(selectedAddress),
    enabled: Boolean(selectedAddress),
  });

  const deleteMailboxMutation = useMutation({
    mutationFn: deleteMailbox,
    onSuccess: (_data, address) => {
      queryClient.removeQueries({ queryKey: queryKeys.mailbox(address) });
      queryClient.removeQueries({ queryKey: queryKeys.mailboxMessages(address) });
      queryClient.removeQueries({ queryKey: queryKeys.adminMailboxMessages(address) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const mailboxes = mailboxesQuery.data ?? EMPTY_MAILBOXES;
  const messages = messagesQuery.data ?? [];
  const pageError =
    error ??
    (mailboxesQuery.isError
      ? errorMessage(mailboxesQuery.error, "Could not load mailboxes")
      : null);
  const messagesError = messagesQuery.isError
    ? errorMessage(messagesQuery.error, "Could not load messages")
    : null;

  const openMessages = (mailbox: MailboxListItem) => {
    setSelectedMailbox(mailbox);
    void queryClient.invalidateQueries({
      queryKey: queryKeys.adminMailboxMessages(mailbox.address),
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

  return {
    domains: domainsQuery.data ?? [],
    mailboxes,
    isLoading: mailboxesQuery.isPending,
    isFetching: mailboxesQuery.isFetching,
    refetch: mailboxesQuery.refetch,
    pageError,
    totalPages: mailboxes.meta.totalPages || 1,
    selectedMailbox,
    setSelectedMailbox,
    messages,
    messagesError,
    isMessagesLoading: messagesQuery.isPending,
    openMessages,
    handleDelete,
    isDeleting: deleteMailboxMutation.isPending,
  };
}
