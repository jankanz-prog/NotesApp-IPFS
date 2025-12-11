-- AlterTable
ALTER TABLE `note` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastEditedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Note_isFavorite_idx` ON `Note`(`isFavorite`);

-- CreateIndex
CREATE INDEX `Note_isArchived_idx` ON `Note`(`isArchived`);
