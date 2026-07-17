import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PageLayout } from "@/components/tempmail/PageLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { getPublicDomains } from "@/lib/api";
import { formatRelativeTime } from "@/lib/date";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import type { PublicDomain } from "@/types/domain";

const EMPTY_DOMAINS: PublicDomain[] = [];

export function DomainsPage() {
  usePageTitle("Domains - TempMail");

  const domainsQuery = useQuery({
    queryKey: queryKeys.publicDomains,
    queryFn: getPublicDomains,
  });

  const domains = domainsQuery.data ?? EMPTY_DOMAINS;
  const defaultDomain = domains.find((domain) => domain.isDefault)?.name ?? "None";
  const inboxStatus = domainsQuery.isError
    ? "Unavailable"
    : domains.length > 0
      ? "Online"
      : "Offline";
  const lastChecked = domainsQuery.dataUpdatedAt
    ? formatRelativeTime(new Date(domainsQuery.dataUpdatedAt).toISOString())
    : domainsQuery.isPending
      ? "Checking..."
      : "Never";

  return (
    <PageLayout>
      <div className="mx-auto w-full">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Domains</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Domains and Status
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Available domains can change over time. Use this status page as a simple snapshot of
              the domains currently configured in the app.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void domainsQuery.refetch()}
            disabled={domainsQuery.isFetching}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${domainsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Active domains</div>
            <div className="mt-1 text-2xl font-semibold">{domains.length}</div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Inbox status</div>
            <div className="mt-1 text-2xl font-semibold">{inboxStatus}</div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Last checked</div>
            <div className="mt-1 text-2xl font-semibold">{lastChecked}</div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Default domain</div>
          <div className="mt-1 truncate font-mono text-sm font-medium text-foreground">
            {defaultDomain}
          </div>
        </div>

        {domainsQuery.isError && (
          <StatusMessage tone="error" className="mt-6">
            {errorMessage(domainsQuery.error, "Could not load domains")}
          </StatusMessage>
        )}

        <div className="mt-6 overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Domain</span>
            <span>Status</span>
          </div>
          {domainsQuery.isPending ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Loading domains...
            </div>
          ) : domains.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No active domains configured.
            </div>
          ) : (
            domains.map((domain) => (
              <div
                key={domain.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-foreground">{domain.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    {domain.label && <span>{domain.label}</span>}
                    {domain.isDefault && <span>Default</span>}
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                  Active
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
