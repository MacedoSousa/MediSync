import { evaluateClinicalAccess, type AccessDenyReason, type ClinicalScope } from "./access-policy";

export interface DelegatedMedicationAccessInput {
  actorId: number;
  caregiverId: number;
  patientId: number;
  scopes: readonly ClinicalScope[];
  startsAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  requestedScope?: ClinicalScope;
  now: Date;
}

export type DelegatedMedicationAccessDecision = { allowed: true } | { allowed: false; reason: AccessDenyReason };

/** O cuidador não recebe autoridade implícita: toda leitura passa pelo escopo explícito e ativo. */
export function evaluateDelegatedMedicationAccess(
  input: DelegatedMedicationAccessInput,
): DelegatedMedicationAccessDecision {
  const decision = evaluateClinicalAccess(
    {
      actorId: String(input.actorId),
      patientId: String(input.patientId),
      role: "caregiver",
      requestedScope: input.requestedScope ?? "medications",
      now: input.now,
    },
    {
      granteeId: String(input.caregiverId),
      patientId: String(input.patientId),
      scopes: input.scopes,
      startsAt: input.startsAt,
      expiresAt: input.expiresAt,
      revokedAt: input.revokedAt ?? undefined,
      authority: "patient_consent",
      authorityReference: "caregiver-consent",
    },
  );
  return decision.allowed ? { allowed: true } : decision;
}
