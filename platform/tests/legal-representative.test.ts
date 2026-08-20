import { describe, expect, it } from "vitest";

import { evaluateClinicalAccess } from "../shared/access-policy";
import {
  createLegalRepresentativeLink,
  createVerifiedRepresentativeGrant,
} from "../shared/legal-representative";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("vínculo de responsável legal", () => {
  it("não cria concessão clínica enquanto a comprovação estiver pendente", () => {
    const link = createLegalRepresentativeLink({
      patientId: "child-001",
      representativeId: "guardian-001",
      relationship: "parent_or_guardian",
      status: "pending_verification",
      createdAt: now,
    });

    expect(createVerifiedRepresentativeGrant(link, now)).toBeUndefined();
  });

  it("cria concessão somente para vínculo verificado e dentro da validade", () => {
    const link = createLegalRepresentativeLink({
      patientId: "child-001",
      representativeId: "guardian-001",
      relationship: "parent_or_guardian",
      status: "verified",
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      verifiedAt: new Date("2026-08-02T00:00:00.000Z"),
      expiresAt: new Date("2027-08-02T00:00:00.000Z"),
    });
    const grant = createVerifiedRepresentativeGrant(link, now);

    expect(grant).toMatchObject({
      granteeId: "guardian-001",
      patientId: "child-001",
      authority: "verified_legal_representative",
    });
    expect(
      evaluateClinicalAccess(
        {
          actorId: "guardian-001",
          patientId: "child-001",
          role: "legal_representative",
          requestedScope: "health_timeline",
          now,
        },
        grant,
      ),
    ).toEqual({ allowed: true, decision: "delegated_access" });
  });

  it("recusa vínculo inválido entre a mesma identidade", () => {
    expect(() =>
      createLegalRepresentativeLink({
        patientId: "patient-001",
        representativeId: "patient-001",
        relationship: "parent_or_guardian",
        status: "pending_verification",
        createdAt: now,
      }),
    ).toThrow("different identities");
  });
});
