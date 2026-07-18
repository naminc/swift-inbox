import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/date";
import { readableMessageBody } from "@/lib/email-content";
import type { InboxMessage } from "@/types/message";
import type { MailboxListItem } from "@/types/mailbox";

type MailboxMessagesDialogProps = {
  mailbox: MailboxListItem | null;
  messages: InboxMessage[];
  error: string | null;
  isLoading: boolean;
  onClose: () => void;
};

export function MailboxMessagesDialog({
  mailbox,
  messages,
  error,
  isLoading,
  onClose,
}: MailboxMessagesDialogProps) {
  return (
    <Dialog open={Boolean(mailbox)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mailbox messages</DialogTitle>
          <DialogDescription className="break-all">
            {mailbox?.address ?? "Selected mailbox"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <StatusMessage tone="error" className="px-3 py-2">
            {error}
          </StatusMessage>
        )}

        <div className="max-h-[460px] overflow-y-auto rounded-md border border-border">
          {mailbox && isLoading ? (
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
  );
}
