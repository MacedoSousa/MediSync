import { describe, expect, it } from "vitest";

import {
  decideGovernanceRuleReview,
  summarizeAssistiveGovernanceMetrics,
} from "../shared/assistive-governance-review";

describe("governança administrativa da IA assistiva", () => {
  it("aprova, rejeita ou desativa regras apenas pelas transições permitidas", () => {
    const pendingRule = {
      id: "regra-seguranca-01",
      reviewStatus: "pending" as const,
      enabled: false,
    };

    expect(decideGovernanceRuleReview({ rule: pendingRule, decision: "approve" })).toMatchObject({
      reviewStatus: "approved",
      enabled: true,
    });
    expect(decideGovernanceRuleReview({ rule: pendingRule, decision: "reject" })).toMatchObject({
      reviewStatus: "rejected",
      enabled: false,
    });
    expect(
      decideGovernanceRuleReview({
        rule: { ...pendingRule, reviewStatus: "approved", enabled: true },
        decision: "disable",
      }),
    ).toMatchObject({ reviewStatus: "disabled", enabled: false });
    expect(() => decideGovernanceRuleReview({ rule: pendingRule, decision: "disable" })).toThrow(/aprovada/i);
  });

  it("agrega métricas sem incluir texto de resposta, dado clínico ou identidade de paciente", () => {
    const summary = summarizeAssistiveGovernanceMetrics([
      { metricType: "generated", occurredAt: new Date("2026-08-20T10:00:00.000Z") },
      { metricType: "generated", occurredAt: new Date("2026-08-20T10:01:00.000Z") },
      { metricType: "blocked", occurredAt: new Date("2026-08-20T10:02:00.000Z") },
      { metricType: "feedback_safety_concern", occurredAt: new Date("2026-08-20T10:03:00.000Z") },
    ]);

    expect(summary).toEqual({
      generated: 2,
      blocked: 1,
      feedbackHelpful: 0,
      feedbackNotHelpful: 0,
      feedbackSafetyConcern: 1,
      agentDisabled: 0,
      total: 4,
    });
  });
});
