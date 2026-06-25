-- CreateTable
CREATE TABLE `RepairRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `repairCategory` ENUM('SCREEN_REPLACEMENT', 'BATTERY_REPLACEMENT', 'CAMERA_REPAIR', 'CHARGING_PORT', 'SPEAKER_REPAIR', 'MICROPHONE_REPAIR', 'SOFTWARE_ISSUE', 'WATER_DAMAGE', 'MOTHERBOARD_REPAIR', 'OTHER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `customerLatitude` DECIMAL(10, 8) NOT NULL,
    `customerLongitude` DECIMAL(11, 8) NOT NULL,
    `customerAddress` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'QUOTATION_SENT', 'WAITING_CUSTOMER_RESPONSE', 'APPOINTMENT_CONFIRMED', 'REPAIR_IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RepairRequest_userId_idx`(`userId`),
    INDEX `RepairRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairRequestImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairRequestId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SelectedServiceCenter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairRequestId` INTEGER NOT NULL,
    `googlePlaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `rating` DOUBLE NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SelectedServiceCenter_repairRequestId_idx`(`repairRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairRequestId` INTEGER NOT NULL,
    `serviceCenterId` INTEGER NOT NULL,
    `estimatedCost` DECIMAL(10, 2) NOT NULL,
    `estimatedRepairDays` INTEGER NOT NULL,
    `warranty` VARCHAR(191) NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULE_REQUESTED', 'ANOTHER_SERVICE_CENTER_REQUESTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Quotation_repairRequestId_idx`(`repairRequestId`),
    INDEX `Quotation_serviceCenterId_idx`(`serviceCenterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairRequestId` INTEGER NOT NULL,
    `quotationId` INTEGER NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Appointment_repairRequestId_key`(`repairRequestId`),
    UNIQUE INDEX `Appointment_quotationId_key`(`quotationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotationId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('BKASH', 'NAGAD', 'ROCKET', 'CARD', 'CASH') NULL,
    `paymentStatus` ENUM('PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_quotationId_key`(`quotationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairRequestImage` ADD CONSTRAINT `RepairRequestImage_repairRequestId_fkey` FOREIGN KEY (`repairRequestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectedServiceCenter` ADD CONSTRAINT `SelectedServiceCenter_repairRequestId_fkey` FOREIGN KEY (`repairRequestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_repairRequestId_fkey` FOREIGN KEY (`repairRequestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_serviceCenterId_fkey` FOREIGN KEY (`serviceCenterId`) REFERENCES `SelectedServiceCenter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_repairRequestId_fkey` FOREIGN KEY (`repairRequestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
