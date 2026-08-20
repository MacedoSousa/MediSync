import { describe, expect, it } from "vitest";

import { evaluateClinicalAccess } from "../shared/access-policy";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("evaluateClinicalAccess", () => {
  it("permite somente o próprio paciente na leitura sem delegação", () => {
    const decision = evaluateClinicalAccess({
      actorId: "patient-1",
      patientId: "patient-1",
      role: "patient",
      requestedScope: "health_timeline",
      now,
    });

    expect(decision).toEqual({ allowed: true, decision: "self_access" });
  });

  it("nega ao cuidador acesso a um escopo não concedido", () => {
    const decision = evaluateClinicalAccess(
      {
        actorId: "caregiver-1",
        patientId: "patient-1",
        role: "caregiver",
        requestedScope: "health_timeline",
        now,
      },
      {
        granteeId: "caregiver-1",
        patientId: "patient-1",
        scopes: ["medications"],
        startsAt: new Date("2026-08-01T00:00:00.000Z"),
        expiresAt: new Date("2026-09-01T00:00:00.000Z"),
        authority: "patient_consent",
        authorityReference: "consent-001",
      },
    );

    expect(decision).toEqual({ allowed: false, reason: "scope_not_granted" });
  });

  it("nega acesso delegado revogado", () => {
    const decision = evaluateClinicalAccess(
      {
        actorId: "caregiver-1",
        patientId: "patient-1",
        role: "caregiver",
        requestedScope: "medications",
        now,
      },
      {
        granteeId: "caregiver-1",
        patientId: "patient-1",
        scopes: ["medications"],
        startsAt: new Date("2026-08-01T00:00:00.000Z"),
        expiresAt: new Date("2026-09-01T00:00:00.000Z"),
        revokedAt: new Date("2026-08-19T00:00:00.000Z"),
        authority: "patient_consent",
        authorityReference: "consent-001",
      },
    );

    expect(decision).toEqual({ allowed: false, reason: "grant_not_active" });
  });
});
