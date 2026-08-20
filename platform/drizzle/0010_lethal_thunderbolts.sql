CREATE TABLE `partnerRescheduleDeliveries` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`rescheduleRequestId` varchar(64) NOT NULL,
	`sourceSystemId` varchar(128) NOT NULL,
	`deliveryId` varchar(128) NOT NULL,
	`correlationId` varchar(64) NOT NULL,
	`resultingStatus` enum('requested','under_review','options_received','completed','declined','withdrawn') NOT NULL,
	`receivedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerRescheduleDeliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_reschedule_source_delivery_unique` UNIQUE(`sourceSystemId`,`deliveryId`)
);
