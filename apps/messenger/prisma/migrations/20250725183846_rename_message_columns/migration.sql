/*
 Warnings:
 
 - You are about to rename the column `createdAt` on the `messages` table to `created_at`.
 - You are about to rename the column `groupId` on the `messages` table to `conversation_id`.
 - You are about to rename the column `message` on the `messages` table to `content`.
 - You are about to rename the column `updatedAt` on the `messages` table to `updated_at`.
 - You are about to rename the column `userId` on the `messages` table to `user_id`.
 
 */
-- AlterTable
ALTER TABLE `messages` CHANGE COLUMN `createdAt` `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CHANGE COLUMN `groupId` `conversation_id` VARCHAR(191) NOT NULL,
  CHANGE COLUMN `message` `content` VARCHAR(191) NOT NULL,
  CHANGE COLUMN `updatedAt` `updated_at` DATETIME(3) NOT NULL,
  CHANGE COLUMN `userId` `user_id` VARCHAR(191) NOT NULL;