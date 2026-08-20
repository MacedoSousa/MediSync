import { describe, expect, it } from "vitest";

import { createAssistiveSummary, validateAssistiveSummary } from "../shared/assistive-summary";

const records = [
  {
    id: "demo-exam-001",
    patientId: "patient-demo",
    category: "exam" as const,
    title: "Resultado de demonstração disponível",
    occurredAt: "2026-08-12T10:00:00.000Z",
    provenance: { sourceType: "clinical_system" as const, sourceName: "Ambiente MedSync", recordedAt: "2026-08-12T10:00:00.000Z", externalReference: "demo-exam-001" },
  },
];

describe("assistive summary", () => {
  it("cria um resumo assistivo com referência explícita ao registro de origem", () => {
    const summary = createAssistiveSummary({ patientId: "patient-demo", records, generatedAt: new Date("2026-08-20T12:00:00.000Z") });
    expect(summary.disclaimer).toMatch(/assistivo/i);
    expect(summary.items[0]).toMatchObject({ recordId: "demo-exam-001", evidence: [records[0].provenance] });
  });

  it("rejeita pontos sem registro de origem ou com texto clínico proibido", () => {
    expect(() => validateAssistiveSummary({ patientId: "patient-demo", generatedAt: "2026-08-20T12:00:00.000Z", disclaimer: "Resumo assistivo", items: [{ recordId: "inexistente", text: "Registro localizado.", evidence: [] }] }, records)).toThrow(/evidence/i);
    expect(() => validateAssistiveSummary({ patientId: "patient-demo", generatedAt: "2026-08-20T12:00:00.000Z", disclaimer: "Resumo assistivo", items: [{ recordId: "demo-exam-001", text: "Você tem diagnóstico de condição X.", evidence: [records[0].provenance] }] }, records)).toThrow(/prohibited/i);
  });
});
