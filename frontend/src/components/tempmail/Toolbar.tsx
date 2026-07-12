import { Copy, RefreshCw, Shuffle, Trash2, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  email: string;
  onRandom: () => void;
  onRefresh: () => void;
  onDelete: () => void;
}

export function Toolbar({ email, onRandom, onRefresh, onDelete }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 1200);
  };

  const btn =
    "inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-border bg-card px-1.5 py-1.5 text-xs text-foreground hover:bg-accent sm:px-2";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">Your address</div>
        <div className="truncate font-mono text-sm">{email}</div>
      </div>
      <div className="grid w-full min-w-0 grid-cols-4 gap-1 sm:w-auto sm:flex sm:flex-wrap sm:gap-1.5">
        <button type="button" onClick={handleCopy} className={btn}>
          {copyState === "copied" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="truncate">
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Failed" : "Copy"}
          </span>
        </button>
        <button type="button" onClick={onRandom} className={btn}>
          <Shuffle className="h-3.5 w-3.5" />
          <span className="truncate">Random</span>
        </button>
        <button type="button" onClick={onRefresh} className={btn}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="truncate">Refresh</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-border bg-card px-1.5 py-1.5 text-xs text-muted-foreground hover:border-destructive/40 hover:text-destructive sm:px-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="truncate">Delete</span>
        </button>
      </div>
    </div>
  );
}
