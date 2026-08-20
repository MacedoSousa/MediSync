export type AssistiveRuleReviewStatus = "approved" | "pending" | "rejected" | "disabled";

export interface AssistiveGovernanceRule {
  readonly id: string;
  readonly version: string;
  readonly ownerLabel: string;
  readonly reviewStatus: AssistiveRuleReviewStatus;
  readonly reviewedAt: Date;
  readonly enabled: boolean;
}

export interface AssistiveAgentControl {
  readonly enabled: boolean;
  readonly activeRule: AssistiveGovernanceRule;
}

const prohibitedTerms = ["diagnóstic", "diagnostic", "prognóst", "prognostic", "prescrev", "dose", "dosagem", "posologia", "tratamento", "cura"] as const;

export function createAssistiveGovernanceRule(rule: AssistiveGovernanceRule): AssistiveGovernanceRule {
  if (!rule.id.trim() || !rule.version.trim()) throw new Error("Assistive governance rule id and version are required.");
  if (!rule.ownerLabel.trim()) throw new Error("Assistive governance rule owner is required.");
  if (rule.reviewStatus !== "approved" || !rule.enabled) {
    throw new Error("Assistive governance rule must be approved and enabled.");
  }
  if (Number.isNaN(rule.reviewedAt.getTime())) throw new Error("Assistive governance rule review date is required.");
  return Object.freeze({ ...rule });
}

export function evaluateAssistiveContent(text: string): { allowed: true } | { allowed: false; reason: "prohibited_clinical_content" } {
  const normalized = text.toLocaleLowerCase("pt-BR");
  return prohibitedTerms.some((term) => normalized.includes(term))
    ? { allowed: false, reason: "prohibited_clinical_content" }
    : { allowed: true };
}

export function assertAssistiveAgentEnabled(control: AssistiveAgentControl): void {
  if (!control.enabled || !control.activeRule.enabled || control.activeRule.reviewStatus !== "approved") {
    throw new Error("Assistive agent is disabled or its rule is not approved.");
  }
}
