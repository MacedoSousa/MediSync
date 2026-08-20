CREATE TABLE `caregiverGrants` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`caregiverUserId` int NOT NULL,
	`scopesJson` text NOT NULL,
	`startsAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caregiverGrants_id` PRIMARY KEY(`id`),
	CONSTRAINT `caregiver_patient_caregiver_unique` UNIQUE(`patientUserId`,`caregiverUserId`)
);
