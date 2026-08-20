import { describe, expect, it } from "vitest";

import {
  createConsentRecord,
  hasActiveConsentScope,
  revokeConsentRecord,
} from "../shared/consent-record";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("registro de consentimento", () => {
  it("permite somente o escopo, a finalidade e o prazo explicitamente concedidos", () => {
    const consent = createConsentRecord({
      patientId: "patient-001",
      granteeId: "caregiver-001",
      purpose: "caregiver_support",
      scopes: ["medications"],
      grantedAt: now,
      expiresAt: new Date("2026-09-01T12:00:00.000Z"),
    });

    expect(hasActiveConsentScope(consent, "medications", now)).toBe(true);
    expect(hasActiveConsentScope(consent, "health_timeline", now)).toBe(false);
  });

  it("interrompe o uso do consentimento na revogação ou expiração", () => {
    const consent = createConsentRecord({
      patientId: "patient-001",
      granteeId: "caregiver-001",
      purpose: "caregiver_support",
      scopes: ["medications"],
      grantedAt: now,
      expiresAt: new Date("2026-09-01T12:00:00.000Z"),
    });

    expect(hasActiveConsentScope(revokeConsentRecord(consent, now), "medications", now)).toBe(false);
    expect(hasActiveConsentScope(consent, "medications", new Date("2026-09-02T12:00:00.000Z"))).toBe(false);
  });

  it("recusa consentimento para a própria identidade ou sem escopo", () => {
    expect(() =>
      createConsentRecord({
        patientId: "patient-001",
        granteeId: "patient-001",
        purpose: "caregiver_support",
        scopes: ["medications"],
        grantedAt: now,
        expiresAt: new Date("2026-09-01T12:00:00.000Z"),
      }),
    ).toThrow("different identities");

    expect(() =>
      createConsentRecord({
        patientId: "patient-001",
        granteeId: "caregiver-001",
        purpose: "caregiver_support",
        scopes: [],
        grantedAt: now,
        expiresAt: new Date("2026-09-01T12:00:00.000Z"),
      }),
    ).toThrow("at least one scope");
  });
});
