import {
  bigint,
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  assistiveAgentEnabled: boolean("assistiveAgentEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const legalRepresentativeLinks = mysqlTable(
  "legalRepresentativeLinks",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    representativeUserId: int("representativeUserId").notNull(),
    relationship: mysqlEnum("relationship", ["parent_or_guardian", "court_appointed_guardian"])
      .notNull(),
    status: mysqlEnum("status", ["pending_verification", "verified", "rejected"])
      .default("pending_verification")
      .notNull(),
    verificationReference: varchar("verificationReference", { length: 128 }),
    verifiedAt: timestamp("verifiedAt"),
    expiresAt: timestamp("expiresAt").notNull(),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientRepresentativeUnique: uniqueIndex("legal_patient_representative_unique").on(
      table.patientUserId,
      table.representativeUserId,
    ),
  }),
);

export type LegalRepresentativeLink = typeof legalRepresentativeLinks.$inferSelect;
export type InsertLegalRepresentativeLink = typeof legalRepresentativeLinks.$inferInsert;

export const caregiverGrants = mysqlTable(
  "caregiverGrants",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    caregiverUserId: int("caregiverUserId").notNull(),
    consentRecordId: varchar("consentRecordId", { length: 64 }).notNull(),
    scopesJson: text("scopesJson").notNull(),
    startsAt: timestamp("startsAt").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientCaregiverUnique: uniqueIndex("caregiver_patient_caregiver_unique").on(
      table.patientUserId,
      table.caregiverUserId,
    ),
  }),
);

export type CaregiverGrant = typeof caregiverGrants.$inferSelect;
export type InsertCaregiverGrant = typeof caregiverGrants.$inferInsert;

export const consentRecords = mysqlTable(
  "consentRecords",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    granteeUserId: int("granteeUserId").notNull(),
    purpose: mysqlEnum("purpose", ["caregiver_support", "appointment_coordination", "emergency_contact"])
      .notNull(),
    scopesJson: text("scopesJson").notNull(),
    grantedAt: timestamp("grantedAt").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientGranteePurposeUnique: uniqueIndex("consent_patient_grantee_purpose_unique").on(
      table.patientUserId,
      table.granteeUserId,
      table.purpose,
    ),
  }),
);

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = typeof consentRecords.$inferInsert;

export const careContacts = mysqlTable(
  "careContacts",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    nameCiphertext: text("nameCiphertext").notNull(),
    phoneCiphertext: text("phoneCiphertext").notNull(),
    contactFingerprint: varchar("contactFingerprint", { length: 64 }).notNull(),
    category: mysqlEnum("category", ["family", "healthcare", "emergency_service", "other"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientContactUnique: uniqueIndex("care_contact_patient_fingerprint_unique").on(
      table.patientUserId,
      table.contactFingerprint,
    ),
  }),
);

export type CareContact = typeof careContacts.$inferSelect;
export type InsertCareContact = typeof careContacts.$inferInsert;

export const medicationIntakeLogs = mysqlTable(
  "medicationIntakeLogs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    actorUserId: int("actorUserId").notNull(),
    medicationPlanReference: varchar("medicationPlanReference", { length: 128 }).notNull(),
    status: mysqlEnum("status", ["taken", "not_taken", "needs_help"]).notNull(),
    occurredAt: timestamp("occurredAt").notNull(),
    recordedAt: timestamp("recordedAt").notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 64 }).notNull(),
    correctionOfId: varchar("correctionOfId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    patientIdempotencyUnique: uniqueIndex("medication_intake_patient_key_unique").on(
      table.patientUserId,
      table.idempotencyKey,
    ),
  }),
);

export type MedicationIntakeLog = typeof medicationIntakeLogs.$inferSelect;
export type InsertMedicationIntakeLog = typeof medicationIntakeLogs.$inferInsert;

export const confirmedAppointments = mysqlTable(
  "confirmedAppointments",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    status: mysqlEnum("status", ["confirmed", "cancelled"]).notNull(),
    startsAt: timestamp("startsAt").notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull(),
    location: text("location").notNull(),
    professionalLabel: varchar("professionalLabel", { length: 160 }).notNull(),
    preparationInstructions: text("preparationInstructions").notNull(),
    sourceId: varchar("sourceId", { length: 64 }).notNull(),
    sourceLabel: varchar("sourceLabel", { length: 256 }).notNull(),
    sourceType: mysqlEnum("sourceType", ["partner_api", "manual_verified", "demo"]).notNull(),
    sourceReceivedAt: timestamp("sourceReceivedAt").notNull(),
    cancelledAt: timestamp("cancelledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientSourceUnique: uniqueIndex("appointment_patient_source_unique").on(
      table.patientUserId,
      table.sourceId,
    ),
  }),
);

export type ConfirmedAppointmentRecord = typeof confirmedAppointments.$inferSelect;
export type InsertConfirmedAppointmentRecord = typeof confirmedAppointments.$inferInsert;

export const rescheduleRequests = mysqlTable(
  "rescheduleRequests",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    appointmentId: varchar("appointmentId", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["requested", "under_review", "options_received", "completed", "declined", "withdrawn"])
      .default("requested")
      .notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 64 }).notNull(),
    requestedAt: timestamp("requestedAt").notNull(),
    sourceLabel: varchar("sourceLabel", { length: 256 }).notNull(),
    sourceType: mysqlEnum("sourceType", ["partner_api", "manual_verified", "demo"]).notNull(),
    sourceReceivedAt: timestamp("sourceReceivedAt").notNull(),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientIdempotencyUnique: uniqueIndex("reschedule_patient_key_unique").on(
      table.patientUserId,
      table.idempotencyKey,
    ),
  }),
);

export type RescheduleRequestRecord = typeof rescheduleRequests.$inferSelect;
export type InsertRescheduleRequestRecord = typeof rescheduleRequests.$inferInsert;

export const partnerRescheduleDeliveries = mysqlTable(
  "partnerRescheduleDeliveries",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    rescheduleRequestId: varchar("rescheduleRequestId", { length: 64 }).notNull(),
    sourceSystemId: varchar("sourceSystemId", { length: 128 }).notNull(),
    deliveryId: varchar("deliveryId", { length: 128 }).notNull(),
    correlationId: varchar("correlationId", { length: 64 }).notNull(),
    resultingStatus: mysqlEnum("resultingStatus", ["requested", "under_review", "options_received", "completed", "declined", "withdrawn"])
      .notNull(),
    receivedAt: timestamp("receivedAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sourceDeliveryUnique: uniqueIndex("partner_reschedule_source_delivery_unique").on(
      table.sourceSystemId,
      table.deliveryId,
    ),
  }),
);

export type PartnerRescheduleDelivery = typeof partnerRescheduleDeliveries.$inferSelect;
export type InsertPartnerRescheduleDelivery = typeof partnerRescheduleDeliveries.$inferInsert;

export const syntheticHealthAssets = mysqlTable(
  "syntheticHealthAssets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    assetType: mysqlEnum("assetType", ["exam_result", "radiology_image", "document"]).notNull(),
    assetCode: varchar("assetCode", { length: 128 }).notNull(),
    titleCiphertext: text("titleCiphertext").notNull(),
    summaryCiphertext: text("summaryCiphertext").notNull(),
    sourceId: varchar("sourceId", { length: 64 }).notNull(),
    sourceLabel: varchar("sourceLabel", { length: 256 }).notNull(),
    sourceType: mysqlEnum("sourceType", ["demo"]).default("demo").notNull(),
    occurredAt: timestamp("occurredAt").notNull(),
    storageObjectKey: varchar("storageObjectKey", { length: 512 }),
    isSynthetic: boolean("isSynthetic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientAssetCodeUnique: uniqueIndex("synthetic_asset_patient_code_unique").on(
      table.patientUserId,
      table.assetCode,
    ),
  }),
);

export type SyntheticHealthAssetRecord = typeof syntheticHealthAssets.$inferSelect;
export type InsertSyntheticHealthAssetRecord = typeof syntheticHealthAssets.$inferInsert;

export const assistiveGovernanceRules = mysqlTable(
  "assistiveGovernanceRules",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    ruleId: varchar("ruleId", { length: 128 }).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    ownerLabel: varchar("ownerLabel", { length: 160 }).notNull(),
    policyFingerprint: varchar("policyFingerprint", { length: 64 }).notNull(),
    reviewStatus: mysqlEnum("reviewStatus", ["approved", "pending", "rejected", "disabled"]).notNull(),
    reviewedAt: timestamp("reviewedAt").notNull(),
    enabled: boolean("enabled").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ruleVersionUnique: uniqueIndex("assistive_rule_version_unique").on(table.ruleId, table.version),
  }),
);

export type AssistiveGovernanceRuleRecord = typeof assistiveGovernanceRules.$inferSelect;
export type InsertAssistiveGovernanceRuleRecord = typeof assistiveGovernanceRules.$inferInsert;

export const assistiveResponseReviews = mysqlTable(
  "assistiveResponseReviews",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    patientUserId: int("patientUserId").notNull(),
    ruleRecordId: varchar("ruleRecordId", { length: 64 }).notNull(),
    correlationId: varchar("correlationId", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "blocked"]).notNull(),
    reason: varchar("reason", { length: 96 }).notNull(),
    responseFingerprint: varchar("responseFingerprint", { length: 64 }).notNull(),
    feedback: mysqlEnum("feedback", ["helpful", "not_helpful", "safety_concern"]),
    reviewerUserId: int("reviewerUserId"),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    responseCorrelationUnique: uniqueIndex("assistive_review_correlation_unique").on(table.correlationId),
  }),
);

export type AssistiveResponseReviewRecord = typeof assistiveResponseReviews.$inferSelect;
export type InsertAssistiveResponseReviewRecord = typeof assistiveResponseReviews.$inferInsert;

export const assistiveMetricEvents = mysqlTable("assistiveMetricEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  metricType: mysqlEnum("metricType", ["generated", "blocked", "feedback_helpful", "feedback_not_helpful", "feedback_safety_concern", "agent_disabled"])
    .notNull(),
  ruleRecordId: varchar("ruleRecordId", { length: 64 }),
  correlationId: varchar("correlationId", { length: 64 }).notNull(),
  occurredAt: timestamp("occurredAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssistiveMetricEvent = typeof assistiveMetricEvents.$inferSelect;
export type InsertAssistiveMetricEvent = typeof assistiveMetricEvents.$inferInsert;

export const auditEvents = mysqlTable("auditEvents", {
  sequence: bigint("sequence", { mode: "number" }).autoincrement().primaryKey(),
  id: varchar("id", { length: 64 }).notNull().unique(),
  actorUserId: int("actorUserId").notNull(),
  patientUserId: int("patientUserId").notNull(),
  action: mysqlEnum("action", [
    "legal_representative_requested",
    "legal_representative_verified",
    "caregiver_granted",
    "caregiver_revoked",
    "consent_granted",
    "consent_revoked",
    "access_denied",
    "health_record_viewed",
    "care_contact_created",
    "care_contact_removed",
    "medication_intake_logged",
    "medication_routine_viewed",
    "appointment_viewed",
    "reschedule_requested",
    "reschedule_status_updated",
    "synthetic_asset_viewed",
    "assistive_summary_generated",
    "assistive_preference_updated",
    "assistive_governance_rule_reviewed",
    "assistive_response_reviewed",
    "assistive_feedback_recorded",
  ]).notNull(),
  resourceType: mysqlEnum("resourceType", ["legal_representative", "caregiver_grant", "consent", "health_record", "care_contact", "medication_intake", "medication_routine", "appointment", "reschedule_request", "synthetic_health_asset", "assistive_summary", "assistive_preference", "assistive_governance_rule", "assistive_response_review"])
    .notNull(),
  resourceId: varchar("resourceId", { length: 64 }).notNull(),
  purpose: mysqlEnum("purpose", ["access_control", "caregiver_support", "privacy_management", "clinical_record_access", "care_coordination", "ai_governance"])
    .notNull(),
  outcome: mysqlEnum("outcome", ["success", "denied"]).notNull(),
  correlationId: varchar("correlationId", { length: 64 }).notNull(),
  previousHash: varchar("previousHash", { length: 64 }).notNull(),
  eventHash: varchar("eventHash", { length: 64 }).notNull().unique(),
  occurredAt: timestamp("occurredAt").notNull(),
});

export type AuditEvent = typeof auditEvents.$inferSelect;
export type InsertAuditEvent = typeof auditEvents.$inferInsert;
