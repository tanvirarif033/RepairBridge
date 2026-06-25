/*
  Warnings:

  - You are about to drop the `repairrequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `repairrequest` DROP FOREIGN KEY `RepairRequest_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `repairrequest` DROP FOREIGN KEY `RepairRequest_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `repairrequest`;

-- DropTable
DROP TABLE `service`;

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_key` ON `User`(`phone`);
