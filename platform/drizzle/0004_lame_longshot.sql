CREATE TABLE `auditEvents` (
	`sequence` bigint AUTO_INCREMENT NOT NULL,
	`id` varchar(64) NOT NULL,
	`actorUserId` int NOT NULL,
	`patientUserId` int NOT NULL,
	`action` enum('legal_representative_requested','legal_representative_verified','caregiver_granted','caregiver_revoked','consent_granted','consent_revoked','access_denied','health_record_viewed') NOT NULL,
	`resourceType` enum('legal_representative','caregiver_grant','consent','health_record') NOT NULL,
	`resourceId` varchar(64) NOT NULL,
	`purpose` enum('access_control','caregiver_support','privacy_management','clinical_record_access') NOT NULL,
	`outcome` enum('success','denied') NOT NULL,
	`correlationId` varchar(64) NOT NULL,
	`previousHash` varchar(64) NOT NULL,
	`eventHash` varchar(64) NOT NULL,
	`occurredAt` timestamp NOT NULL,
	CONSTRAINT `auditEvents_sequence` PRIMARY KEY(`sequence`),
	CONSTRAINT `auditEvents_id_unique` UNIQUE(`id`),
	CONSTRAINT `auditEvents_eventHash_unique` UNIQUE(`eventHash`)
);
