CREATE TABLE `consentRecords` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`granteeUserId` int NOT NULL,
	`purpose` enum('caregiver_support','appointment_coordination','emergency_contact') NOT NULL,
	`scopesJson` text NOT NULL,
	`grantedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consentRecords_id` PRIMARY KEY(`id`),
	CONSTRAINT `consent_patient_grantee_purpose_unique` UNIQUE(`patientUserId`,`granteeUserId`,`purpose`)
);
--> statement-breakpoint
ALTER TABLE `caregiverGrants` ADD `consentRecordId` varchar(64) NOT NULL;