-- Add status field to AbuseReport with default "new"
ALTER TABLE `AbuseReport` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'new';
