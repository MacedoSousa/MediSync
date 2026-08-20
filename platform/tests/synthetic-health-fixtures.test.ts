import { describe, expect, it } from "vitest";

import {
  SYNTHETIC_DATA_NOTICE,
  createSyntheticHealthScenario,
  isSyntheticHealthData,
} from "../shared/testing/synthetic-health-fixtures";

describe("createSyntheticHealthScenario", () => {
  it("cria o mesmo cenário de demonstração em execuções distintas", () => {
    const firstScenario = createSyntheticHealthScenario();
    const secondScenario = createSyntheticHealthScenario();

    expect(firstScenario).toEqual(secondScenario);
    expect(firstScenario).not.toBe(secondScenario);
  });

  it("identifica cada registro como demonstração e preserva sua proveniência", () => {
    const scenario = createSyntheticHealthScenario();

    expect(SYNTHETIC_DATA_NOTICE).toMatch(/demonstração/i);
    expect(scenario.timeline).toHaveLength(4);
    expect(scenario.timeline.map((entry) => entry.category)).toEqual([
      "consultation",
      "document",
      "exam",
      "exam",
    ]);
    expect(scenario.timeline.every((entry) => isSyntheticHealthData(entry.provenance))).toBe(true);
    expect(scenario.alerts.every((alert) => alert.evidence.every(isSyntheticHealthData))).toBe(true);
  });

  it("não contém identificadores pessoais diretos no cenário de demonstração", () => {
    const serializedScenario = JSON.stringify(createSyntheticHealthScenario()).toLowerCase();

    expect(serializedScenario).not.toMatch(/@/);
    expect(serializedScenario).not.toMatch(/\+55|\(\d{2}\)|cep|cpf|rg/);
    expect(serializedScenario).toContain("demo-patient-001");
  });
});
