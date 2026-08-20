CREATE TABLE `confirmedAppointments` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`status` enum('confirmed','cancelled') NOT NULL,
	`startsAt` timestamp NOT NULL,
	`timezone` varchar(64) NOT NULL,
	`location` text NOT NULL,
	`professionalLabel` varchar(160) NOT NULL,
	`preparationInstructions` text NOT NULL,
	`sourceId` varchar(64) NOT NULL,
	`sourceLabel` varchar(256) NOT NULL,
	`sourceType` enum('partner_api','manual_verified','demo') NOT NULL,
	`sourceReceivedAt` timestamp NOT NULL,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `confirmedAppointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointment_patient_source_unique` UNIQUE(`patientUserId`,`sourceId`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `action` enum('legal_representative_requested','legal_representative_verified','caregiver_granted','caregiver_revoked','consent_granted','consent_revoked','access_denied','health_record_viewed','care_contact_created','care_contact_removed','medication_intake_logged','medication_routine_viewed','appointment_viewed') NOT NULL;--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `resourceType` enum('legal_representative','caregiver_grant','consent','health_record','care_contact','medication_intake','medication_routine','appointment') NOT NULL;