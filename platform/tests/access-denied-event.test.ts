import { describe, expect, it } from "vitest";

import { createAccessDeniedEvent } from "../shared/access-denied-event";

describe("createAccessDeniedEvent", () => {
  it("registra tentativa bloqueada sem carregar dados clínicos ou texto livre", () => {
    const event = createAccessDeniedEvent({
      id: "denied-001",
      actorUserId: 7,
      patientUserId: 7,
      resourceType: "consent",
      resourceId: "consent-001",
      correlationId: "correlation-007",
      occurredAt: new Date("2026-08-20T12:05:00.000Z"),
    });

    expect(event).toMatchObject({
      action: "access_denied",
      outcome: "denied",
      purpose: "access_control",
      resourceType: "consent",
    });
    expect(Object.keys(event)).not.toContain("reason");
  });

  it("recusa tentativa sem identificador de correlação", () => {
    expect(() =>
      createAccessDeniedEvent({
        id: "denied-002",
        actorUserId: 7,
        patientUserId: 7,
        resourceType: "consent",
        resourceId: "consent-002",
        correlationId: "",
        occurredAt: new Date(),
      }),
    ).toThrow("correlation");
  });
});
