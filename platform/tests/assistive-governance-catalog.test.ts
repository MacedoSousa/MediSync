import { describe, expect, it } from "vitest";

import { createGovernanceCatalogEntry, reviewAssistiveResponse } from "../shared/assistive-governance-catalog";

describe("assistive governance catalog", () => {
  const rule = {
    id: "rule-001",
    version: "1.1.0",
    ownerLabel: "Responsável clínico demonstrativo",
    policyText: "Organizar apenas fatos com evidência e sem orientação clínica.",
    reviewedAt: new Date("2026-08-20T10:00:00.000Z"),
  };

  it("mantém uma regra aprovada, versionada e atribuída a um responsável", () => {
    const entry = createGovernanceCatalogEntry({ ...rule, status: "approved" });

    expect(entry).toMatchObject({ id: "rule-001", version: "1.1.0", status: "approved" });
    expect(entry.ownerLabel).toMatch(/responsável/i);
  });

  it("bloqueia a resposta insegura e a encaminha para revisão", () => {
    const review = reviewAssistiveResponse({
      reviewId: "review-001",
      rule: { ...rule, status: "approved" },
      responseText: "Você tem diagnóstico de condição X.",
      createdAt: new Date("2026-08-20T10:01:00.000Z"),
    });

    expect(review).toMatchObject({ status: "blocked", reason: "prohibited_clinical_content", requiresHumanReview: true });
  });
});
