import { describe, expect, it } from "vitest";

import { getSyntheticHealthRecordDetail } from "../shared/health-record-detail";
import { createSyntheticHealthScenario } from "../shared/testing/synthetic-health-fixtures";

describe("health record detail", () => {
  const scenario = createSyntheticHealthScenario();

  it("retorna somente registros pertencentes ao paciente solicitado", () => {
    expect(getSyntheticHealthRecordDetail(scenario, "demo-patient-001", "demo-timeline-002")?.id).toBe("demo-timeline-002");
    expect(getSyntheticHealthRecordDetail(scenario, "other-patient", "demo-timeline-002")).toBeUndefined();
  });

  it("mantém anexos demonstrativos bloqueados para abertura e explícitos sobre a origem", () => {
    const detail = getSyntheticHealthRecordDetail(scenario, "demo-patient-001", "demo-timeline-002");

    expect(detail?.isSynthetic).toBe(true);
    expect(detail?.attachments[0]).toMatchObject({ availability: "not_connected", isSynthetic: true });
  });
});
