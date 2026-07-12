import { RefreshCw } from "lucide-react";
import type { MockEmail } from "@/lib/mock-data";
import { InboxItem } from "./InboxItem";

interface Props {
  emails: MockEmail[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onRandom?: () => void;
}

export function InboxList({ emails, activeId, onSelect, onRefresh, onRandom }: Props) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex min-w-0 items-center justify-between border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">Inbox</h2>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh"
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {emails.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Inbox is empty</div>
              <p className="mt-1">
                Refresh the inbox or generate a new address to load sample mail.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent"
              >
                Refresh
              </button>
              {onRandom && (
                <button
                  type="button"
                  onClick={onRandom}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Random address
                </button>
              )}
            </div>
          </div>
        ) : (
          emails.map((e) => (
            <InboxItem
              key={e.id}
              email={e}
              active={e.id === activeId}
              onClick={() => onSelect(e.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
