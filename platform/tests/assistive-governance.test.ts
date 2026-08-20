import { describe, expect, it } from "vitest";

import {
  assertAssistiveAgentEnabled,
  createAssistiveGovernanceRule,
  evaluateAssistiveContent,
  type AssistiveGovernanceRule,
} from "../shared/assistive-governance";

describe("assistive AI governance", () => {
  const activeRule: AssistiveGovernanceRule = createAssistiveGovernanceRule({
    id: "demo-rule-001",
    version: "1.0.0",
    ownerLabel: "Revisão clínica de demonstração",
    reviewStatus: "approved",
    reviewedAt: new Date("2026-08-20T00:00:00.000Z"),
    enabled: true,
  });

  it("exige responsável, versão e revisão para liberar uma regra", () => {
    expect(activeRule.ownerLabel).toBe("Revisão clínica de demonstração");
    expect(() => createAssistiveGovernanceRule({ ...activeRule, ownerLabel: "", id: "demo-rule-002" })).toThrow("owner");
    expect(() => createAssistiveGovernanceRule({ ...activeRule, id: "demo-rule-003", reviewStatus: "pending" })).toThrow("approved");
  });

  it("bloqueia conteúdo clínico proibido e permite desligamento imediato", () => {
    expect(evaluateAssistiveContent("Registro disponível para revisão na origem.")).toEqual({ allowed: true });
    expect(evaluateAssistiveContent("O diagnóstico é definitivo.")).toEqual({ allowed: false, reason: "prohibited_clinical_content" });
    expect(() => assertAssistiveAgentEnabled({ enabled: false, activeRule })).toThrow("disabled");
  });
});
