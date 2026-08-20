import { describe, expect, it } from "vitest";

import { PARTNER_RESCHEDULE_UPDATE_SCHEMA_VERSION, validatePartnerRescheduleUpdate } from "../shared/partner-reschedule-adapter";

const validEnvelope = {
  schemaVersion: PARTNER_RESCHEDULE_UPDATE_SCHEMA_VERSION,
  sourceSystemId: "agenda-parceira-demonstracao",
  deliveryId: "delivery-001",
  correlationId: "request-001",
  occurredAt: "2026-08-20T10:15:00.000Z",
  update: {
    externalRequestReference: "request-001",
    status: "under_review" as const,
  },
};

describe("validatePartnerRescheduleUpdate", () => {
  it("aceita uma atualização versionada com emissor, correlação e idempotência", () => {
    expect(validatePartnerRescheduleUpdate(validEnvelope)).toEqual({
      accepted: true,
      sourceSystemId: "agenda-parceira-demonstracao",
      deliveryId: "delivery-001",
      correlationId: "request-001",
    });
  });

  it("rejeita atualização sem emissor, correlação ou data válida", () => {
    expect(() => validatePartnerRescheduleUpdate({ ...validEnvelope, sourceSystemId: " " })).toThrow(/source system/i);
    expect(() => validatePartnerRescheduleUpdate({ ...validEnvelope, correlationId: " " })).toThrow(/correlation/i);
    expect(() => validatePartnerRescheduleUpdate({ ...validEnvelope, occurredAt: "invalido" })).toThrow(/timestamp/i);
  });

  it("rejeita estado fora do contrato e referência externa incompatível", () => {
    expect(() => validatePartnerRescheduleUpdate({ ...validEnvelope, update: { ...validEnvelope.update, status: "requested" as never } })).toThrow(/status/i);
    expect(() => validatePartnerRescheduleUpdate({ ...validEnvelope, update: { ...validEnvelope.update, externalRequestReference: "outro-pedido" } })).toThrow(/correlation/i);
  });
});
