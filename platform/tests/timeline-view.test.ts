import { describe, expect, it } from "vitest";

import { buildTimelineView, provenanceLabel } from "../shared/timeline-view";
import { createSyntheticHealthScenario } from "../shared/testing/synthetic-health-fixtures";

describe("timeline view", () => {
  it("ordena a linha do tempo do evento mais recente ao mais antigo", () => {
    const view = buildTimelineView(createSyntheticHealthScenario().timeline);

    expect(view.map((entry) => entry.id)).toEqual([
      "demo-timeline-004",
      "demo-timeline-003",
      "demo-timeline-002",
      "demo-timeline-001",
    ]);
  });

  it("marca proveniência sintética como demonstração, sem tratá-la como histórico clínico confirmado", () => {
    const [entry] = buildTimelineView(createSyntheticHealthScenario().timeline);

    expect(entry.isSynthetic).toBe(true);
    expect(provenanceLabel(entry.provenance)).toContain("Demonstração");
  });
});
