import type { AssistiveRuleReviewStatus } from "./assistive-governance";

export const assistiveMetricTypes = [
  "generated",
  "blocked",
  "feedback_helpful",
  "feedback_not_helpful",
  "feedback_safety_concern",
  "agent_disabled",
] as const;

export type AssistiveMetricType = (typeof assistiveMetricTypes)[number];
export type GovernanceReviewDecision = "approve" | "reject" | "disable";

export interface GovernanceRuleReviewTarget {
  readonly id: string;
  readonly reviewStatus: AssistiveRuleReviewStatus;
  readonly enabled: boolean;
}

export function decideGovernanceRuleReview(input: {
  rule: GovernanceRuleReviewTarget;
  decision: GovernanceReviewDecision;
}): Readonly<{ reviewStatus: AssistiveRuleReviewStatus; enabled: boolean }> {
  if (!input.rule.id.trim()) throw new Error("Identificador da regra de governança é obrigatório.");

  if (input.decision === "approve") {
    if (input.rule.reviewStatus !== "pending") {
      throw new Error("Somente regras pendentes podem ser aprovadas.");
    }
    return Object.freeze({ reviewStatus: "approved", enabled: true });
  }

  if (input.decision === "reject") {
    if (input.rule.reviewStatus !== "pending") {
      throw new Error("Somente regras pendentes podem ser rejeitadas.");
    }
    return Object.freeze({ reviewStatus: "rejected", enabled: false });
  }

  if (input.rule.reviewStatus !== "approved" || !input.rule.enabled) {
    throw new Error("Somente regra aprovada e habilitada pode ser desativada.");
  }
  return Object.freeze({ reviewStatus: "disabled", enabled: false });
}

export interface AssistiveMetricSample {
  readonly metricType: AssistiveMetricType;
  readonly occurredAt: Date;
}

export interface AssistiveGovernanceMetricSummary {
  readonly generated: number;
  readonly blocked: number;
  readonly feedbackHelpful: number;
  readonly feedbackNotHelpful: number;
  readonly feedbackSafetyConcern: number;
  readonly agentDisabled: number;
  readonly total: number;
}

/** Agregação mínima: não recebe nem devolve resposta, conteúdo clínico ou identidade de paciente. */
export function summarizeAssistiveGovernanceMetrics(
  samples: readonly AssistiveMetricSample[],
): AssistiveGovernanceMetricSummary {
  const summary = {
    generated: 0,
    blocked: 0,
    feedbackHelpful: 0,
    feedbackNotHelpful: 0,
    feedbackSafetyConcern: 0,
    agentDisabled: 0,
    total: 0,
  };

  for (const sample of samples) {
    if (Number.isNaN(sample.occurredAt.getTime())) throw new Error("Data da métrica de governança é obrigatória.");
    summary.total += 1;
    if (sample.metricType === "generated") summary.generated += 1;
    if (sample.metricType === "blocked") summary.blocked += 1;
    if (sample.metricType === "feedback_helpful") summary.feedbackHelpful += 1;
    if (sample.metricType === "feedback_not_helpful") summary.feedbackNotHelpful += 1;
    if (sample.metricType === "feedback_safety_concern") summary.feedbackSafetyConcern += 1;
    if (sample.metricType === "agent_disabled") summary.agentDisabled += 1;
  }

  return Object.freeze(summary);
}
