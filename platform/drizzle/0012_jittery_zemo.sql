CREATE TABLE `assistiveGovernanceRules` (
	`id` varchar(64) NOT NULL,
	`ruleId` varchar(128) NOT NULL,
	`version` varchar(32) NOT NULL,
	`ownerLabel` varchar(160) NOT NULL,
	`policyFingerprint` varchar(64) NOT NULL,
	`reviewStatus` enum('approved','pending','rejected','disabled') NOT NULL,
	`reviewedAt` timestamp NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistiveGovernanceRules_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistive_rule_version_unique` UNIQUE(`ruleId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `assistiveMetricEvents` (
	`id` varchar(64) NOT NULL,
	`metricType` enum('generated','blocked','feedback_helpful','feedback_not_helpful','feedback_safety_concern','agent_disabled') NOT NULL,
	`ruleRecordId` varchar(64),
	`correlationId` varchar(64) NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistiveMetricEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assistiveResponseReviews` (
	`id` varchar(64) NOT NULL,
	`patientUserId` int NOT NULL,
	`ruleRecordId` varchar(64) NOT NULL,
	`correlationId` varchar(64) NOT NULL,
	`status` enum('pending','approved','blocked') NOT NULL,
	`reason` varchar(96) NOT NULL,
	`responseFingerprint` varchar(64) NOT NULL,
	`feedback` enum('helpful','not_helpful','safety_concern'),
	`reviewerUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistiveResponseReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistive_review_correlation_unique` UNIQUE(`correlationId`)
);
