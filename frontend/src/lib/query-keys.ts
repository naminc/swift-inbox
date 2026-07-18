import type { ListAbuseReportsParams } from "@/types/abuse";
import type { ListMailboxesParams } from "@/types/mailbox";

export const queryKeys = {
  adminRoot: ["admin"] as const,
  adminMe: ["admin", "me"] as const,
  publicDomains: ["domains", "public"] as const,
  domains: ["domains"] as const,
  mailbox: (address: string) => ["mailbox", address] as const,
  mailboxMessages: (address: string) => ["mailbox", address, "messages"] as const,
  adminMailboxMessages: (address: string) => ["admin", "mailbox", address, "messages"] as const,
  adminMailboxesRoot: ["admin", "mailboxes"] as const,
  adminMailboxes: (params: ListMailboxesParams) => ["admin", "mailboxes", params] as const,
  abuseReportsRoot: ["admin", "abuse", "reports"] as const,
  abuseReports: (params: ListAbuseReportsParams) => ["admin", "abuse", "reports", params] as const,
  abuseReport: (id: number) => ["admin", "abuse", "report", id] as const,
  settings: ["admin", "settings"] as const,
  publicSettings: ["settings", "public"] as const,
  cleanupStats: ["admin", "cleanup", "stats"] as const,
};
