export type CleanupStats = {
  expiredMailboxes: number;
  totalMailboxes: number;
  totalMessages: number;
  nextRunHint: string | null;
};

export type CleanupResult = {
  deletedMailboxes: number;
  ranAt: string;
};
