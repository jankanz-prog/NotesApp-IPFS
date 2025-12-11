-- Add password reset fields to User table
ALTER TABLE `User` ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL;



