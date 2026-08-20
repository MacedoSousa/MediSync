import type { ClinicalScope } from "./access-policy";

export type AlertPriority = "information" | "attention" | "contact_care_team";

export interface DataProvenance {
  sourceType: "patient_reported" | "caregiver_reported" | "clinical_system" | "verified_partner";
  sourceName: string;
  recordedAt: string;
  externalReference?: string;
}

export interface HealthTimelineEntry {
  id: string;
  patientId: string;
  category: "consultation" | "exam" | "medication" | "document";
  title: string;
  occurredAt: string;
  provenance: DataProvenance;
}

export interface CareAccessGrant {
  id: string;
  patientId: string;
  granteeId: string;
  scopes: ClinicalScope[];
  purpose: "daily_care" | "legal_representation";
  startsAt: string;
  expiresAt: string;
  status: "active" | "revoked" | "expired";
}

export interface ExplainableHealthAlert {
  id: string;
  patientId: string;
  priority: AlertPriority;
  title: string;
  explanation: string;
  safeAction: "review_record" | "contact_care_team" | "confirm_medication_log";
  evidence: DataProvenance[];
  generatedAt: string;
  ruleVersion: string;
}
