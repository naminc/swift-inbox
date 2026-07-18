export type CleanupStats = {
  expiredMailboxes: number;
  purgeableMailboxes: number;
  retentionDays: number;
  totalMailboxes: number;
  totalMessages: number;
  nextRunHint: string | null;
};

export type CleanupResult = {
  deletedMailboxes: number;
  retentionDays: number;
  ranAt: string;
};
