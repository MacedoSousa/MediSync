import { describe, expect, it } from "vitest";

import { createMedicationIntakeLog } from "../shared/medication-intake";

describe("medication intake log", () => {
  const base = {
    id: "log-001",
    patientUserId: 7,
    actorUserId: 7,
    medicationPlanReference: "demo-plan-001",
    status: "taken" as const,
    occurredAt: new Date("2026-08-20T08:00:00.000Z"),
    recordedAt: new Date("2026-08-20T08:01:00.000Z"),
    idempotencyKey: "request-001",
  };

  it("registra autoria, momento e chave idempotente sem dose ou recomendação", () => {
    const log = createMedicationIntakeLog(base);
    expect(log).toMatchObject({ actorUserId: 7, patientUserId: 7, status: "taken", idempotencyKey: "request-001" });
    expect("dose" in log).toBe(false);
  });

  it("permite correção apenas como novo evento referenciando o registro original", () => {
    const correction = createMedicationIntakeLog({
      ...base,
      id: "log-002",
      idempotencyKey: "request-002",
      status: "not_taken",
      correctionOfId: "log-001",
    });
    expect(correction.correctionOfId).toBe("log-001");
  });

  it("recusa log sem identidade, chave idempotente ou referência de plano", () => {
    expect(() => createMedicationIntakeLog({ ...base, idempotencyKey: "" })).toThrow("idempotency");
    expect(() => createMedicationIntakeLog({ ...base, medicationPlanReference: "" })).toThrow("plan");
    expect(() => createMedicationIntakeLog({ ...base, actorUserId: 0 })).toThrow("identity");
  });
});
