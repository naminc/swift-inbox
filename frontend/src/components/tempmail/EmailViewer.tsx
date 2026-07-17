import { Loader2, Mail, Trash2 } from "lucide-react";
import type { EmailListItem } from "@/types/message";

interface Props {
  email: EmailListItem | null;
  to: string;
  isDeleting?: boolean;
  onDelete?: (id: string) => void;
}

export function EmailViewer({ email, to, isDeleting = false, onDelete }: Props) {
  if (!email) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-md border border-border bg-card p-8 text-center">
        <Mail className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-muted-foreground">Select an email to read</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[400px] flex-col rounded-md border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h2 className="min-w-0 break-words text-base font-semibold">{email.subject}</h2>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(email.id)}
              disabled={isDeleting}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Delete message"
              title="Delete message"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        <dl className="mt-3 grid gap-1 text-xs">
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted-foreground">From</dt>
            <dd>
              <span className="font-medium">{email.from}</span>{" "}
              <span className="text-muted-foreground">&lt;{email.fromEmail}&gt;</span>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted-foreground">To</dt>
            <dd className="truncate font-mono">{to}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted-foreground">Time</dt>
            <dd>{email.time}</dd>
          </div>
        </dl>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed break-words whitespace-pre-wrap">
        {email.body}
      </div>
    </div>
  );
}
