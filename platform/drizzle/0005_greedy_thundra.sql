CREATE TABLE `careContacts` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`nameCiphertext` text NOT NULL,
	`phoneCiphertext` text NOT NULL,
	`contactFingerprint` varchar(64) NOT NULL,
	`category` enum('family','healthcare','emergency_service','other') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careContacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `care_contact_patient_fingerprint_unique` UNIQUE(`patientUserId`,`contactFingerprint`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `action` enum('legal_representative_requested','legal_representative_verified','caregiver_granted','caregiver_revoked','consent_granted','consent_revoked','access_denied','health_record_viewed','care_contact_created','care_contact_removed') NOT NULL;--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `resourceType` enum('legal_representative','caregiver_grant','consent','health_record','care_contact') NOT NULL;--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `purpose` enum('access_control','caregiver_support','privacy_management','clinical_record_access','care_coordination') NOT NULL;