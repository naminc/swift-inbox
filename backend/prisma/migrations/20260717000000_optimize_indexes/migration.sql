-- Create the composite index FIRST so the foreign key on Message.mailboxId
-- can rely on it (its leftmost column is mailboxId). MySQL refuses to drop
-- the single-column index while it is still needed by the FK constraint.
CREATE INDEX `Message_mailboxId_receivedAt_idx` ON `Message`(`mailboxId`, `receivedAt`);

-- Now it is safe to drop the redundant single-column indexes on Message.
DROP INDEX `Message_mailboxId_idx` ON `Message`;
DROP INDEX `Message_receivedAt_idx` ON `Message`;

-- Drop redundant index on Mailbox.address (already covered by UNIQUE constraint).
DROP INDEX `Mailbox_address_idx` ON `Mailbox`;
