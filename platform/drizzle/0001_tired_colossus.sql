CREATE TABLE `legalRepresentativeLinks` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`representativeUserId` int NOT NULL,
	`relationship` enum('parent_or_guardian','court_appointed_guardian') NOT NULL,
	`status` enum('pending_verification','verified','rejected') NOT NULL DEFAULT 'pending_verification',
	`verificationReference` varchar(128),
	`verifiedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalRepresentativeLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `legal_patient_representative_unique` UNIQUE(`patientUserId`,`representativeUserId`)
);
