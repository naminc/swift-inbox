import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { deleteMessage, getMailboxMessages, markMessageRead } from "@/lib/api";
import { mapInboxMessage } from "@/lib/email-content";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { EmailListItem } from "@/types/message";
import type { InboxMessage } from "@/types/message";

const EMPTY_EMAILS: EmailListItem[] = [];

export function useInboxMessages(
  mailboxAddress: string,
  isMailboxExpired: boolean,
  setError: (error: string | null) => void,
) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRefreshPending, setIsRefreshPending] = useState(false);

  const messagesQuery = useQuery({
    queryKey: queryKeys.mailboxMessages(mailboxAddress),
    queryFn: () => getMailboxMessages(mailboxAddress),
    enabled: Boolean(mailboxAddress) && !isMailboxExpired,
    refetchInterval: mailboxAddress && !isMailboxExpired ? 5000 : false,
    refetchIntervalInBackground: false,
    select: (messages) => messages.map(mapInboxMessage),
  });

  const markMessageReadMutation = useMutation({
    mutationFn: ({
      messageId,
      mailboxAddress: addr,
      isRead,
    }: {
      messageId: number;
      mailboxAddress: string;
      isRead: boolean;
    }) => markMessageRead(messageId, addr, isRead),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: ({
      messageId,
      mailboxAddress: addr,
    }: {
      messageId: number;
      mailboxAddress: string;
    }) => deleteMessage(messageId, addr),
    onSuccess: (_data, { messageId, mailboxAddress: addr }) => {
      queryClient.setQueryData<InboxMessage[]>(queryKeys.mailboxMessages(addr), (cur) =>
        cur?.filter((m) => m.id !== messageId),
      );
      setActiveId((cur) => (cur === String(messageId) ? null : cur));
    },
  });

  const emails = isMailboxExpired ? EMPTY_EMAILS : (messagesQuery.data ?? EMPTY_EMAILS);
  const active = emails.find((item) => item.id === activeId) ?? null;
  const isMessagesLoading = Boolean(mailboxAddress) && !isMailboxExpired && messagesQuery.isPending;

  useEffect(() => {
    if (messagesQuery.isError)
      setError(errorMessage(messagesQuery.error, "Could not load inbox messages"));
  }, [messagesQuery.error, messagesQuery.isError, setError]);

  useEffect(() => {
    setActiveId((cur) => (cur && emails.some((e) => e.id === cur) ? cur : null));
  }, [emails]);

  const handleSelect = useCallback(
    (id: string) => {
      setActiveId(id);
      const messageId = Number(id);
      if (!Number.isInteger(messageId) || !mailboxAddress) return;

      queryClient.setQueryData<InboxMessage[]>(queryKeys.mailboxMessages(mailboxAddress), (cur) =>
        cur?.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)),
      );

      markMessageReadMutation.mutate(
        { messageId, mailboxAddress, isRead: true },
        {
          onError: (err) => {
            setError(errorMessage(err, "Could not mark message as read"));
            void queryClient.invalidateQueries({
              queryKey: queryKeys.mailboxMessages(mailboxAddress),
            });
          },
        },
      );
    },
    [mailboxAddress, markMessageReadMutation, queryClient, setError],
  );

  const handleDeleteMessage = useCallback(
    (id: string) => {
      const messageId = Number(id);
      if (!Number.isInteger(messageId) || !mailboxAddress) return;
      setError(null);
      deleteMessageMutation.mutate(
        { messageId, mailboxAddress },
        { onError: (err) => setError(errorMessage(err, "Could not delete message")) },
      );
    },
    [deleteMessageMutation, mailboxAddress, setError],
  );

  const refetchMessages = useCallback(() => {
    return messagesQuery.refetch();
  }, [messagesQuery]);

  return {
    emails,
    active,
    activeId,
    isMessagesLoading,
    isRefreshPending,
    setIsRefreshPending,
    isDeletingMessage: deleteMessageMutation.isPending,
    handleSelect,
    handleDeleteMessage,
    refetchMessages,
  };
}
