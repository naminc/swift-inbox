import { DOMAINS } from "@/lib/mock-data";

interface Props {
  username: string;
  domain: string;
  onUsernameChange: (v: string) => void;
  onDomainChange: (v: string) => void;
  onGenerate: () => void;
}

export function EmailCreator({
  username,
  domain,
  onUsernameChange,
  onDomainChange,
  onGenerate,
}: Props) {
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
          className="w-full min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
        />
        <select
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          className="w-full min-w-0 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/60 sm:w-auto"
        >
          {DOMAINS.map((d) => (
            <option key={d.value} value={d.value}>
              @{d.value}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onGenerate}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          Get Email
        </button>
      </div>
    </section>
  );
}
