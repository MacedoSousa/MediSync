import { describe, expect, it } from "vitest";

import { evaluateClinicalAccess } from "../shared/access-policy";
import {
  createCaregiverGrant,
  revokeCaregiverGrant,
  toClinicalAccessGrant,
} from "../shared/caregiver-grant";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("concessão de cuidador", () => {
  it("mantém apenas os escopos explicitamente concedidos", () => {
    const grant = createCaregiverGrant({
      patientId: "patient-001",
      caregiverId: "caregiver-001",
      scopes: ["medications"],
      startsAt: now,
      expiresAt: new Date("2026-09-01T12:00:00.000Z"),
    });

    const accessGrant = toClinicalAccessGrant(grant, now);
    expect(accessGrant?.scopes).toEqual(["medications"]);
    expect(
      evaluateClinicalAccess(
        {
          actorId: "caregiver-001",
          patientId: "patient-001",
          role: "caregiver",
          requestedScope: "health_timeline",
          now,
        },
        accessGrant,
      ),
    ).toEqual({ allowed: false, reason: "scope_not_granted" });
  });

  it("recusa concessão sem escopo, para a própria pessoa ou além do prazo máximo", () => {
    expect(() =>
      createCaregiverGrant({
        patientId: "patient-001",
        caregiverId: "patient-001",
        scopes: ["medications"],
        startsAt: now,
        expiresAt: new Date("2026-09-01T12:00:00.000Z"),
      }),
    ).toThrow("different identities");

    expect(() =>
      createCaregiverGrant({
        patientId: "patient-001",
        caregiverId: "caregiver-001",
        scopes: [],
        startsAt: now,
        expiresAt: new Date("2026-09-01T12:00:00.000Z"),
      }),
    ).toThrow("at least one scope");

    expect(() =>
      createCaregiverGrant({
        patientId: "patient-001",
        caregiverId: "caregiver-001",
        scopes: ["medications"],
        startsAt: now,
        expiresAt: new Date("2027-03-01T12:00:00.000Z"),
      }),
    ).toThrow("maximum duration");
  });

  it("interrompe imediatamente o acesso quando a concessão é revogada", () => {
    const grant = createCaregiverGrant({
      patientId: "patient-001",
      caregiverId: "caregiver-001",
      scopes: ["medications"],
      startsAt: now,
      expiresAt: new Date("2026-09-01T12:00:00.000Z"),
    });

    expect(toClinicalAccessGrant(revokeCaregiverGrant(grant, now), now)).toBeUndefined();
  });
});
