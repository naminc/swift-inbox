-- Drop redundant index on Mailbox.address (already covered by UNIQUE constraint)
DROP INDEX `Mailbox_address_idx` ON `Mailbox`;

-- Replace separate single-column indexes on Message with a composite index
-- that covers the hot query: WHERE mailboxId = ? ORDER BY receivedAt DESC
DROP INDEX `Message_mailboxId_idx` ON `Message`;
DROP INDEX `Message_receivedAt_idx` ON `Message`;
CREATE INDEX `Message_mailboxId_receivedAt_idx` ON `Message`(`mailboxId`, `receivedAt`);
