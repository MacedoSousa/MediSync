import type { ClinicalScope } from "./access-policy";

export type ConsentPurpose = "caregiver_support" | "appointment_coordination" | "emergency_contact";

export interface ConsentRecordInput {
  patientId: string;
  granteeId: string;
  purpose: ConsentPurpose;
  scopes: readonly ClinicalScope[];
  grantedAt: Date;
  expiresAt: Date;
}

export interface ConsentRecord extends ConsentRecordInput {
  id: string;
  revokedAt?: Date;
}

/**
 * Consentimento é uma autorização restrita a escopo, finalidade e prazo. Ele
 * não substitui a comprovação de representação legal e não concede acesso por
 * padrão a nenhum dado clínico adicional.
 */
export function createConsentRecord(input: ConsentRecordInput): ConsentRecord {
  if (input.patientId === input.granteeId) {
    throw new Error("Patient and grantee must be different identities.");
  }
  if (input.scopes.length === 0) {
    throw new Error("A consent record requires at least one scope.");
  }
  if (input.expiresAt <= input.grantedAt) {
    throw new Error("Consent expiry must be after it is granted.");
  }

  return {
    ...input,
    id: `consent-${input.patientId}-${input.granteeId}-${input.grantedAt.toISOString()}`,
  };
}

export function revokeConsentRecord(record: ConsentRecord, revokedAt: Date): ConsentRecord {
  return { ...record, revokedAt };
}

export function hasActiveConsentScope(
  record: ConsentRecord,
  scope: ClinicalScope,
  now: Date,
): boolean {
  return !record.revokedAt && record.grantedAt <= now && now < record.expiresAt && record.scopes.includes(scope);
}
