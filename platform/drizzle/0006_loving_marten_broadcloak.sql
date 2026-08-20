CREATE TABLE `medicationIntakeLogs` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`medicationPlanReference` varchar(128) NOT NULL,
	`status` enum('taken','not_taken','needs_help') NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`recordedAt` timestamp NOT NULL,
	`idempotencyKey` varchar(64) NOT NULL,
	`correctionOfId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicationIntakeLogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `medication_intake_patient_key_unique` UNIQUE(`patientUserId`,`idempotencyKey`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `action` enum('legal_representative_requested','legal_representative_verified','caregiver_granted','caregiver_revoked','consent_granted','consent_revoked','access_denied','health_record_viewed','care_contact_created','care_contact_removed','medication_intake_logged') NOT NULL;--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `resourceType` enum('legal_representative','caregiver_grant','consent','health_record','care_contact','medication_intake') NOT NULL;