/*
  Warnings:

  - You are about to alter the column `name` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `conversations` MODIFY `name` VARCHAR(100) NOT NULL;
