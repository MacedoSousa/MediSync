export const clinicalScopes = [
  "health_timeline",
  "medications",
  "appointments",
  "emergency_contacts",
] as const;

export type ClinicalScope = (typeof clinicalScopes)[number];

export type AccessRole = "patient" | "legal_representative" | "caregiver" | "professional" | "pharmacy";

export type GrantAuthority = "patient_consent" | "verified_legal_representative";

export interface ClinicalAccessRequest {
  actorId: string;
  patientId: string;
  role: AccessRole;
  requestedScope: ClinicalScope;
  now: Date;
}

export interface ClinicalAccessGrant {
  granteeId: string;
  patientId: string;
  scopes: readonly ClinicalScope[];
  startsAt: Date;
  expiresAt: Date;
  authority: GrantAuthority;
  authorityReference: string;
  revokedAt?: Date;
}

export type AccessDenyReason =
  | "patient_mismatch"
  | "grant_missing"
  | "grant_not_active"
  | "scope_not_granted"
  | "legal_authority_not_verified"
  | "role_not_supported";

export type ClinicalAccessDecision =
  | { allowed: true; decision: "self_access" | "delegated_access" }
  | { allowed: false; reason: AccessDenyReason };

/**
 * Regra pura de autorização para o MVP. Não existe acesso de exceção,
 * "break glass" ou acesso clínico institucional implícito nesta política.
 * Essas capacidades exigem governança operacional e fluxos próprios.
 */
export function evaluateClinicalAccess(
  request: ClinicalAccessRequest,
  grant?: ClinicalAccessGrant,
): ClinicalAccessDecision {
  if (request.role === "patient") {
    return request.actorId === request.patientId
      ? { allowed: true, decision: "self_access" }
      : { allowed: false, reason: "patient_mismatch" };
  }

  if (request.role !== "legal_representative" && request.role !== "caregiver") {
    return { allowed: false, reason: "role_not_supported" };
  }

  if (!grant || grant.granteeId !== request.actorId || grant.patientId !== request.patientId) {
    return { allowed: false, reason: "grant_missing" };
  }

  if (
    request.role === "legal_representative" &&
    grant.authority !== "verified_legal_representative"
  ) {
    return { allowed: false, reason: "legal_authority_not_verified" };
  }

  if (request.role === "caregiver" && grant.authority !== "patient_consent") {
    return { allowed: false, reason: "grant_missing" };
  }

  const isActive = !grant.revokedAt && grant.startsAt <= request.now && request.now < grant.expiresAt;
  if (!isActive) {
    return { allowed: false, reason: "grant_not_active" };
  }

  if (!grant.scopes.includes(request.requestedScope)) {
    return { allowed: false, reason: "scope_not_granted" };
  }

  return { allowed: true, decision: "delegated_access" };
}
