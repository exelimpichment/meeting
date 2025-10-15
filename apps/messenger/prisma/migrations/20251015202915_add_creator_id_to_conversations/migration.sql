-- AlterTable
ALTER TABLE `conversations` ADD COLUMN `creator_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
