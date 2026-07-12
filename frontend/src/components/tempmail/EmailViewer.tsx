import { Mail } from "lucide-react";
import type { MockEmail } from "@/lib/mock-data";

interface Props {
  email: MockEmail | null;
  to: string;
}

export function EmailViewer({ email, to }: Props) {
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
        <h2 className="text-base font-semibold">{email.subject}</h2>
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
      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-line">
        {email.body}
      </div>
    </div>
  );
}
