import type { MockEmail } from "@/lib/mock-data";

interface Props {
  email: MockEmail;
  active: boolean;
  onClick: () => void;
}

export function InboxItem({ email, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-w-0 flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent ${
        active ? "bg-accent" : ""
      }`}
    >
      <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
        <span
          className={`min-w-0 flex-1 truncate text-sm ${email.unread ? "font-semibold" : "font-medium text-muted-foreground"}`}
        >
          {email.from}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{email.time}</span>
      </div>
      <div className="w-full truncate text-sm text-foreground/90">{email.subject}</div>
      <div className="w-full truncate text-xs text-muted-foreground">{email.preview}</div>
    </button>
  );
}
