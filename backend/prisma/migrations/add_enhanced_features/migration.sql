-- Add new fields to Note table
ALTER TABLE `Note` ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Note` ADD COLUMN `wordCount` INT NOT NULL DEFAULT 0;
ALTER TABLE `Note` ADD COLUMN `readingTime` INT NOT NULL DEFAULT 0;

-- Create Tag table
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tag_userId_name_key`(`userId`, `name`),
    INDEX `Tag_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create NoteTag junction table
CREATE TABLE `NoteTag` (
    `id` VARCHAR(191) NOT NULL,
    `noteId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NoteTag_noteId_tagId_key`(`noteId`, `tagId`),
    INDEX `NoteTag_noteId_idx`(`noteId`),
    INDEX `NoteTag_tagId_idx`(`tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `NoteTag` ADD CONSTRAINT `NoteTag_noteId_fkey` FOREIGN KEY (`noteId`) REFERENCES `Note`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `NoteTag` ADD CONSTRAINT `NoteTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index for isPinned
CREATE INDEX `Note_isPinned_idx` ON `Note`(`isPinned`);

