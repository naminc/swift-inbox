import { Check, Clock, Copy, Loader2, RefreshCw, RotateCcw, Shuffle, Trash2 } from "lucide-react";
import { useState } from "react";

type ExpiryTone = "active" | "warning" | "expired";

interface Props {
  email: string;
  disabled?: boolean;
  expiryLabel?: string | null;
  expiryTone?: ExpiryTone;
  isExpired?: boolean;
  isRefreshing?: boolean;
  isRenewing?: boolean;
  onRandom: () => void;
  onRefresh: () => void;
  onRenew?: () => void;
  onDelete: () => void;
}

export function Toolbar({
  email,
  disabled = false,
  expiryLabel,
  expiryTone = "active",
  isExpired = false,
  isRefreshing = false,
  isRenewing = false,
  onRandom,
  onRefresh,
  onRenew,
  onDelete,
}: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const isRefreshDisabled = disabled || isRefreshing || isExpired;
  const isRenewDisabled = disabled || isRenewing || !onRenew;

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
    "inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-border bg-card px-1.5 py-1.5 text-xs text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-2";
  const expiryClass =
    expiryTone === "expired"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : expiryTone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-orange-300/50 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">Your address</div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 truncate font-mono text-sm">{email}</span>
          {expiryLabel && (
            <span
              className={`inline-flex min-w-[92px] max-w-full shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-[11px] sm:min-w-[104px] ${expiryClass}`}
            >
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{expiryLabel}</span>
            </span>
          )}
        </div>
      </div>
      <div className="grid w-full min-w-0 grid-cols-2 gap-1 sm:w-auto sm:flex sm:flex-wrap sm:gap-1.5">
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
        <button type="button" onClick={onRandom} disabled={disabled} className={btn}>
          <Shuffle className="h-3.5 w-3.5" />
          <span className="truncate">Random</span>
        </button>
        <button type="button" onClick={onRefresh} disabled={isRefreshDisabled} className={btn}>
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="truncate">Refresh</span>
        </button>
        {onRenew && (
          <button type="button" onClick={onRenew} disabled={isRenewDisabled} className={btn}>
            {isRenewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span className="truncate">Renew</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          title="Delete address and messages"
          aria-label="Delete address and messages"
          className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-border bg-card px-1.5 py-1.5 text-xs text-muted-foreground hover:border-destructive/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60 sm:px-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="truncate">Delete</span>
        </button>
      </div>
    </div>
  );
}
