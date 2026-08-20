import { clinicalScopes, type ClinicalAccessGrant, type ClinicalScope } from "./access-policy";

export const legalRepresentativeRelationships = [
  "parent_or_guardian",
  "court_appointed_guardian",
] as const;

export type LegalRepresentativeRelationship = (typeof legalRepresentativeRelationships)[number];
export type LegalRepresentativeVerificationStatus = "pending_verification" | "verified" | "rejected";

export interface LegalRepresentativeLinkInput {
  patientId: string;
  representativeId: string;
  relationship: LegalRepresentativeRelationship;
  status: LegalRepresentativeVerificationStatus;
  createdAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
}

export interface LegalRepresentativeLink extends LegalRepresentativeLinkInput {
  id: string;
}

/**
 * Cria a representação como um registro de domínio. A verificação documental
 * ocorre fora do app e não pode ser inferida por IA, autodeclaração ou vínculo
 * de cuidador. Até o estado ser "verified", não existe concessão de dados.
 */
export function createLegalRepresentativeLink(
  input: LegalRepresentativeLinkInput,
): LegalRepresentativeLink {
  if (input.patientId === input.representativeId) {
    throw new Error("Legal representative and patient must be different identities.");
  }

  if (input.status === "verified" && !input.verifiedAt) {
    throw new Error("A verified legal representative requires a verification timestamp.");
  }

  if (input.expiresAt && input.expiresAt <= input.createdAt) {
    throw new Error("The legal representative expiry must be after creation.");
  }

  return {
    ...input,
    id: `legal-${input.patientId}-${input.representativeId}`,
  };
}

/**
 * Materializa uma concessão somente a partir de uma representação formal já
 * verificada e vigente. O chamador deve persistir o vínculo, a evidência e a
 * auditoria em camada protegida antes de fornecer a concessão à autorização.
 */
export function createVerifiedRepresentativeGrant(
  link: LegalRepresentativeLink,
  now: Date,
  scopes: readonly ClinicalScope[] = clinicalScopes,
): ClinicalAccessGrant | undefined {
  if (
    link.status !== "verified" ||
    !link.verifiedAt ||
    !link.expiresAt ||
    link.verifiedAt > now ||
    link.expiresAt <= now ||
    scopes.length === 0
  ) {
    return undefined;
  }

  return {
    granteeId: link.representativeId,
    patientId: link.patientId,
    scopes,
    startsAt: link.verifiedAt,
    expiresAt: link.expiresAt,
    authority: "verified_legal_representative",
    authorityReference: link.id,
  };
}
