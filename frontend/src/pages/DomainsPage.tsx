import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { DOMAINS } from "@/lib/mock-data";

export function DomainsPage() {
  usePageTitle("Domains - TempMail");

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">Domains</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Domains and Status
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Available domains can change over time. Use this status page as a simple snapshot of the
            domains currently shown in the app.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Active domains</div>
            <div className="mt-1 text-2xl font-semibold">{DOMAINS.length}</div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Inbox status</div>
            <div className="mt-1 text-2xl font-semibold">Online</div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Last checked</div>
            <div className="mt-1 text-2xl font-semibold">Now</div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto] border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Domain</span>
            <span>Status</span>
          </div>
          {DOMAINS.map((domain) => (
            <div
              key={domain.value}
              className="grid grid-cols-[1fr_auto] items-center border-b border-border px-4 py-3 last:border-b-0"
            >
              <div>
                <div className="font-mono text-sm text-foreground">{domain.value}</div>
                {domain.badge && (
                  <div className="mt-1 text-xs text-muted-foreground">{domain.badge}</div>
                )}
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
