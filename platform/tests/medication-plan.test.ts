import { describe, expect, it } from "vitest";

import { createMedicationPlan, medicationPlanView } from "../shared/medication-plan";

const source = {
  sourceType: "clinical_system" as const,
  sourceName: "Fonte clínica de demonstração",
  recordedAt: "2026-08-01T08:00:00.000Z",
  externalReference: "demo-prescription-001",
};

describe("medication plan", () => {
  it("preserva a instrução recebida da fonte sem interpretar dose ou frequência", () => {
    const plan = createMedicationPlan({
      id: "demo-plan-001",
      patientId: "demo-patient-001",
      displayName: "Medicamento de demonstração",
      instructionFromSource: "Instrução fictícia registrada na fonte de demonstração.",
      sourceRecordReference: "demo-prescription-001",
      provenance: source,
      isSynthetic: true,
    });

    expect(medicationPlanView(plan)).toMatchObject({ canChangeDose: false, instruction: "Instrução fictícia registrada na fonte de demonstração." });
  });

  it("recusa plano sem instrução, referência de origem ou proveniência verificável", () => {
    expect(() => createMedicationPlan({ id: "1", patientId: "p", displayName: "x", instructionFromSource: "", sourceRecordReference: "s", provenance: source, isSynthetic: true })).toThrow("instruction");
    expect(() => createMedicationPlan({ id: "1", patientId: "p", displayName: "x", instructionFromSource: "Fonte", sourceRecordReference: "", provenance: source, isSynthetic: true })).toThrow("source reference");
  });
});
