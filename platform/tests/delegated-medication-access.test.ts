import { describe, expect, it } from "vitest";

import { evaluateDelegatedMedicationAccess } from "../shared/delegated-medication-access";

const now = new Date("2026-08-20T12:00:00.000Z");
const baseGrant = {
  caregiverId: 22,
  patientId: 11,
  scopes: ["medications"] as const,
  startsAt: new Date("2026-08-01T00:00:00.000Z"),
  expiresAt: new Date("2026-09-01T00:00:00.000Z"),
};

describe("delegated medication access", () => {
  it("permite somente a rotina medicamentosa quando o consentimento e o escopo estão ativos", () => {
    expect(evaluateDelegatedMedicationAccess({ actorId: 22, now, ...baseGrant })).toEqual({ allowed: true });
  });

  it("bloqueia timeline e documentos quando a concessão contém apenas medicamentos", () => {
    expect(evaluateDelegatedMedicationAccess({ actorId: 22, now, requestedScope: "health_timeline", ...baseGrant })).toEqual({ allowed: false, reason: "scope_not_granted" });
  });

  it("bloqueia imediatamente uma concessão ou consentimento revogado", () => {
    expect(evaluateDelegatedMedicationAccess({ actorId: 22, now, revokedAt: now, ...baseGrant })).toEqual({ allowed: false, reason: "grant_not_active" });
  });
});
