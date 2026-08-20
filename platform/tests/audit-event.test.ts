import { describe, expect, it } from "vitest";

import { createAuditEvent, isAuditChainConsistent, toPatientAuditEntry } from "../shared/audit-event";

describe("evento de auditoria", () => {
  it("registra somente metadados estruturais, sem conteúdo clínico ou tokens", () => {
    const event = createAuditEvent({
      id: "audit-001",
      actorUserId: 23,
      patientUserId: 12,
      action: "consent_revoked",
      resourceType: "consent",
      resourceId: "consent-001",
      purpose: "privacy_management",
      outcome: "success",
      correlationId: "correlation-001",
      occurredAt: new Date("2026-08-20T12:00:00.000Z"),
    });

    expect(event).not.toHaveProperty("metadata");
    expect(event).not.toHaveProperty("clinicalContent");
    expect(toPatientAuditEntry(event)).toEqual({
      action: "consent_revoked",
      resourceType: "consent",
      outcome: "success",
      occurredAt: new Date("2026-08-20T12:00:00.000Z"),
      actorLabel: "Conta autorizada",
    });
  });

  it("recusa ação e recurso fora do catálogo de auditoria", () => {
    expect(() =>
      createAuditEvent({
        id: "audit-001",
        actorUserId: 23,
        patientUserId: 12,
        action: "free_text" as never,
        resourceType: "consent",
        resourceId: "consent-001",
        purpose: "privacy_management",
        outcome: "success",
        correlationId: "correlation-001",
        occurredAt: new Date("2026-08-20T12:00:00.000Z"),
      }),
    ).toThrow("action");
  });

  it("detecta alteração na sequência ou no hash encadeado", () => {
    const event = createAuditEvent({
      id: "audit-002",
      actorUserId: 23,
      patientUserId: 12,
      action: "consent_granted",
      resourceType: "consent",
      resourceId: "consent-002",
      purpose: "privacy_management",
      outcome: "success",
      correlationId: "correlation-002",
      occurredAt: new Date("2026-08-20T12:01:00.000Z"),
    });
    const calculateHash = (entry: typeof event, previousHash: string) => `${entry.id}:${previousHash}`;
    const valid = [{ ...event, previousHash: "GENESIS", eventHash: "audit-002:GENESIS" }];

    expect(isAuditChainConsistent(valid, calculateHash)).toBe(true);
    expect(isAuditChainConsistent([{ ...valid[0], eventHash: "altered" }], calculateHash)).toBe(false);
  });
});
