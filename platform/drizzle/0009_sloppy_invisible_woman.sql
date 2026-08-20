CREATE TABLE `rescheduleRequests` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`appointmentId` varchar(64) NOT NULL,
	`status` enum('requested','under_review','options_received','completed','declined','withdrawn') NOT NULL DEFAULT 'requested',
	`idempotencyKey` varchar(64) NOT NULL,
	`requestedAt` timestamp NOT NULL,
	`sourceLabel` varchar(256) NOT NULL,
	`sourceType` enum('partner_api','manual_verified','demo') NOT NULL,
	`sourceReceivedAt` timestamp NOT NULL,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rescheduleRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `reschedule_patient_key_unique` UNIQUE(`patientUserId`,`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `syntheticHealthAssets` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`assetType` enum('exam_result','radiology_image','document') NOT NULL,
	`assetCode` varchar(128) NOT NULL,
	`titleCiphertext` text NOT NULL,
	`summaryCiphertext` text NOT NULL,
	`sourceId` varchar(64) NOT NULL,
	`sourceLabel` varchar(256) NOT NULL,
	`sourceType` enum('demo') NOT NULL DEFAULT 'demo',
	`occurredAt` timestamp NOT NULL,
	`storageObjectKey` varchar(512),
	`isSynthetic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `syntheticHealthAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `synthetic_asset_patient_code_unique` UNIQUE(`patientUserId`,`assetCode`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `action` enum('legal_representative_requested','legal_representative_verified','caregiver_granted','caregiver_revoked','consent_granted','consent_revoked','access_denied','health_record_viewed','care_contact_created','care_contact_removed','medication_intake_logged','medication_routine_viewed','appointment_viewed','reschedule_requested','reschedule_status_updated','synthetic_asset_viewed') NOT NULL;--> statement-breakpoint
ALTER TABLE `auditEvents` MODIFY COLUMN `resourceType` enum('legal_representative','caregiver_grant','consent','health_record','care_contact','medication_intake','medication_routine','appointment','reschedule_request','synthetic_health_asset') NOT NULL;