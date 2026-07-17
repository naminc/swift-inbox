import { RefreshCw } from "lucide-react";
import type { EmailListItem } from "@/types/message";
import { InboxItem } from "./InboxItem";

interface Props {
  emails: EmailListItem[];
  activeId: string | null;
  isLoading?: boolean;
  isRefreshDisabled?: boolean;
  isRandomDisabled?: boolean;
  isRefreshing?: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onRandom?: () => void;
}

export function InboxList({
  emails,
  activeId,
  isLoading = false,
  isRefreshDisabled: isRefreshBlocked = false,
  isRandomDisabled = false,
  isRefreshing = false,
  onSelect,
  onRefresh,
  onRandom,
}: Props) {
  const isRefreshDisabled = isLoading || isRefreshing || isRefreshBlocked;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex min-w-0 items-center justify-between border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">Inbox</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshDisabled}
          aria-label="Refresh"
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="flex h-full min-h-[240px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Loading inbox...
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Inbox is empty</div>
              <p className="mt-1">Waiting for incoming mail. Refresh or generate a new address.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshDisabled}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>
              {onRandom && (
                <button
                  type="button"
                  onClick={onRandom}
                  disabled={isRandomDisabled}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
