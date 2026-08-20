import { describe, expect, it } from "vitest";

import { createMedicationRoutineAlert } from "../shared/medication-routine-alert";

describe("medication routine alert", () => {
  it("não gera alerta clínico para uma tomada confirmada", () => {
    expect(createMedicationRoutineAlert({ status: "taken", occurredAt: new Date("2026-08-20T08:00:00.000Z") })).toBeNull();
  });

  it("explica o registro não confirmado sem sugerir dose ou compensação", () => {
    const alert = createMedicationRoutineAlert({ status: "not_taken", occurredAt: new Date("2026-08-20T08:00:00.000Z") });
    expect(alert?.title).toContain("conferência");
    expect(alert?.evidence).toContain("não realizada");
    expect(alert?.safeAction).toContain("Não tome dose adicional");
    expect(alert?.clinicalLimit).toContain("não substitui");
  });

  it("orienta pedido de ajuda sem diagnóstico ou decisão automática", () => {
    const alert = createMedicationRoutineAlert({ status: "needs_help", occurredAt: new Date("2026-08-20T08:00:00.000Z") });
    expect(alert?.title).toContain("Ajuda");
    expect(alert?.safeAction).toContain("responsável");
  });
});
