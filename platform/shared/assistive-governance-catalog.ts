import { evaluateAssistiveContent, type AssistiveRuleReviewStatus } from "./assistive-governance";

export interface GovernanceCatalogEntry {
  readonly id: string;
  readonly version: string;
  readonly ownerLabel: string;
  readonly policyText: string;
  readonly reviewedAt: Date;
  readonly status: AssistiveRuleReviewStatus;
}

export interface AssistiveResponseReview {
  readonly reviewId: string;
  readonly status: "approved" | "blocked";
  readonly reason: "approved" | "prohibited_clinical_content";
  readonly requiresHumanReview: boolean;
  readonly createdAt: Date;
  readonly ruleId: string;
  readonly ruleVersion: string;
}

export function createGovernanceCatalogEntry(entry: GovernanceCatalogEntry): GovernanceCatalogEntry {
  if (!entry.id.trim() || !entry.version.trim() || !entry.ownerLabel.trim() || !entry.policyText.trim()) {
    throw new Error("Governance rule id, version, owner and policy are required.");
  }
  if (entry.status !== "approved") throw new Error("Only approved governance rules can become active catalog entries.");
  if (Number.isNaN(entry.reviewedAt.getTime())) throw new Error("Governance rule review timestamp is required.");
  return Object.freeze({ ...entry });
}

export function reviewAssistiveResponse(input: {
  reviewId: string;
  rule: GovernanceCatalogEntry;
  responseText: string;
  createdAt: Date;
}): AssistiveResponseReview {
  const rule = createGovernanceCatalogEntry(input.rule);
  if (!input.reviewId.trim() || Number.isNaN(input.createdAt.getTime())) throw new Error("Review id and timestamp are required.");
  const result = evaluateAssistiveContent(input.responseText);
  return Object.freeze({
    reviewId: input.reviewId,
    status: result.allowed ? "approved" : "blocked",
    reason: result.allowed ? "approved" : result.reason,
    requiresHumanReview: !result.allowed,
    createdAt: input.createdAt,
    ruleId: rule.id,
    ruleVersion: rule.version,
  });
}
