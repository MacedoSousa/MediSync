import type { ClinicalAccessGrant, ClinicalScope } from "./access-policy";

const MAX_CAREGIVER_GRANT_DURATION_DAYS = 90;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export interface CaregiverGrantInput {
  patientId: string;
  caregiverId: string;
  scopes: readonly ClinicalScope[];
  startsAt: Date;
  expiresAt: Date;
}

export interface CaregiverGrant extends CaregiverGrantInput {
  id: string;
  revokedAt?: Date;
}

/**
 * A concessão para cuidador nunca é uma autoridade clínica presumida. Ela exige
 * escopo explícito, expira em até 90 dias e pode ser revogada a qualquer tempo.
 */
export function createCaregiverGrant(input: CaregiverGrantInput): CaregiverGrant {
  if (input.patientId === input.caregiverId) {
    throw new Error("Patient and caregiver must be different identities.");
  }
  if (input.scopes.length === 0) {
    throw new Error("A caregiver grant requires at least one scope.");
  }
  if (input.expiresAt <= input.startsAt) {
    throw new Error("A caregiver grant expiry must be after its start.");
  }

  const duration = input.expiresAt.getTime() - input.startsAt.getTime();
  if (duration > MAX_CAREGIVER_GRANT_DURATION_DAYS * millisecondsPerDay) {
    throw new Error("A caregiver grant exceeds the maximum duration.");
  }

  return {
    ...input,
    id: `caregiver-${input.patientId}-${input.caregiverId}-${input.startsAt.toISOString()}`,
  };
}

export function revokeCaregiverGrant(grant: CaregiverGrant, revokedAt: Date): CaregiverGrant {
  return { ...grant, revokedAt };
}

export function toClinicalAccessGrant(
  grant: CaregiverGrant,
  now: Date,
): ClinicalAccessGrant | undefined {
  if (grant.revokedAt || grant.startsAt > now || grant.expiresAt <= now) {
    return undefined;
  }

  return {
    granteeId: grant.caregiverId,
    patientId: grant.patientId,
    scopes: grant.scopes,
    startsAt: grant.startsAt,
    expiresAt: grant.expiresAt,
    authority: "patient_consent",
    authorityReference: grant.id,
  };
}
