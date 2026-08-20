export const auditActions = [
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
] as const;

export const auditResourceTypes = ["legal_representative", "caregiver_grant", "consent", "health_record", "care_contact", "medication_intake", "medication_routine", "appointment", "reschedule_request", "synthetic_health_asset", "assistive_summary"] as const;
export const auditPurposes = ["access_control", "caregiver_support", "privacy_management", "clinical_record_access", "care_coordination"] as const;

export type AuditAction = (typeof auditActions)[number];
export type AuditResourceType = (typeof auditResourceTypes)[number];
export type AuditPurpose = (typeof auditPurposes)[number];
export type AuditOutcome = "success" | "denied";

export interface AuditEventInput {
  id: string;
  actorUserId: number;
  patientUserId: number;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  purpose: AuditPurpose;
  outcome: AuditOutcome;
  correlationId: string;
  occurredAt: Date;
}

export type AuditEvent = Readonly<AuditEventInput>;

/**
 * O evento não aceita texto livre, conteúdo clínico, credenciais, IP ou tokens.
 * A camada de persistência é apenas de inserção e o paciente recebe uma visão
 * minimizada do registro, sem expor a identidade técnica de terceiros.
 */
export function createAuditEvent(input: AuditEventInput): AuditEvent {
  if (!auditActions.includes(input.action)) {
    throw new Error("Audit action is not allowed.");
  }
  if (!auditResourceTypes.includes(input.resourceType)) {
    throw new Error("Audit resource type is not allowed.");
  }
  if (!auditPurposes.includes(input.purpose)) {
    throw new Error("Audit purpose is not allowed.");
  }
  if (!input.resourceId.trim()) {
    throw new Error("Audit resource identifier is required.");
  }
  if (!input.correlationId.trim()) {
    throw new Error("Audit correlation identifier is required.");
  }
  return Object.freeze({ ...input });
}

export function toAuditHashPayload(event: AuditEvent, previousHash: string) {
  return JSON.stringify({
    action: event.action,
    actorUserId: event.actorUserId,
    correlationId: event.correlationId,
    occurredAt: event.occurredAt.toISOString(),
    outcome: event.outcome,
    patientUserId: event.patientUserId,
    previousHash,
    purpose: event.purpose,
    resourceId: event.resourceId,
    resourceType: event.resourceType,
  });
}

export interface AuditChainEntry extends AuditEvent {
  previousHash: string;
  eventHash: string;
}

export function isAuditChainConsistent(
  entries: readonly AuditChainEntry[],
  calculateHash: (event: AuditEvent, previousHash: string) => string,
): boolean {
  let previousHash = "GENESIS";
  for (const entry of entries) {
    if (entry.previousHash !== previousHash) return false;
    if (entry.eventHash !== calculateHash(entry, previousHash)) return false;
    previousHash = entry.eventHash;
  }
  return true;
}

export function toPatientAuditEntry(event: AuditEvent) {
  return {
    action: event.action,
    resourceType: event.resourceType,
    outcome: event.outcome,
    occurredAt: event.occurredAt,
    actorLabel: "Conta autorizada",
  } as const;
}
