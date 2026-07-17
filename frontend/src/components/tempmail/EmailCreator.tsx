import { Loader2 } from "lucide-react";

export type EmailDomainOption = {
  id: number;
  value: string;
  label?: string | null;
};

interface Props {
  username: string;
  domain: string;
  domains: EmailDomainOption[];
  isLoading?: boolean;
  isGenerating?: boolean;
  disabled?: boolean;
  onUsernameChange: (v: string) => void;
  onDomainChange: (v: string) => void;
  onGenerate: () => void;
}

export function EmailCreator({
  username,
  domain,
  domains,
  isLoading = false,
  isGenerating = false,
  disabled = false,
  onUsernameChange,
  onDomainChange,
  onGenerate,
}: Props) {
  const isDisabled = disabled || isLoading || isGenerating || domains.length === 0;
  const showActionSpinner = isLoading || isGenerating;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Free Temporary Email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free, fast, private temporary email address.
      </p>

      <div className="mt-6 flex w-full min-w-0 flex-col gap-2 sm:flex-row">
        <input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
          placeholder="username"
          disabled={disabled}
          className="w-full min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
        />
        <select
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          disabled={isDisabled}
          className="w-full min-w-0 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/60 sm:w-auto"
        >
          {domains.length === 0 && (
            <option value="">{isLoading ? "Loading domains..." : "No active domains"}</option>
          )}
          {domains.map((d) => (
            <option key={d.value} value={d.value}>
              @{d.value}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isDisabled}
          className="relative inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed sm:w-[128px]"
        >
          {showActionSpinner && <Loader2 className="absolute left-3 h-4 w-4 animate-spin" />}
          <span>{isLoading ? "Loading..." : "Get Email"}</span>
        </button>
      </div>
    </section>
  );
}
