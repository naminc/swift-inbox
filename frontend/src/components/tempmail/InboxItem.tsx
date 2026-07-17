import type { EmailListItem } from "@/types/message";

interface Props {
  email: EmailListItem;
  active: boolean;
  onClick: () => void;
}

export function InboxItem({ email, active, onClick }: Props) {
  const itemStateClass = active ? "bg-accent" : email.unread ? "bg-primary/[0.04]" : "bg-card";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full min-w-0 flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent ${itemStateClass}`}
    >
      {email.unread && <span className="absolute left-1.5 top-3 h-2 w-2 rounded-full bg-primary" />}
      <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            email.unread
              ? "pl-2 font-semibold text-foreground"
              : "font-medium text-muted-foreground"
          }`}
        >
          {email.from}
        </span>
        <span
          className={`shrink-0 text-[11px] ${
            email.unread ? "font-medium text-primary" : "text-muted-foreground"
          }`}
        >
          {email.time}
        </span>
      </div>
      <div
        className={`w-full truncate text-sm ${
          email.unread ? "font-semibold text-foreground" : "text-foreground/80"
        }`}
      >
        {email.subject}
      </div>
      <div
        className={`w-full truncate text-xs ${
          email.unread ? "text-foreground/70" : "text-muted-foreground"
        }`}
      >
        {email.preview}
      </div>
    </button>
  );
}
