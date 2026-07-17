-- Add index on Mailbox.expiresAt for cleanup worker queries
CREATE INDEX `Mailbox_expiresAt_idx` ON `Mailbox`(`expiresAt`);
