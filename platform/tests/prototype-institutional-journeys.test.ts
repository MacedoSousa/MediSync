import { describe, expect, it } from "vitest";

import {
  createPrototypeInstitutionalJourneys,
  getPrototypeJourney,
} from "../shared/testing/prototype-institutional-journeys";

describe("jornadas institucionais demonstrativas", () => {
  it("expõe agenda, cobertura, receita e capacidade sem qualquer operação externa", () => {
    const journeys = createPrototypeInstitutionalJourneys();

    expect(journeys.map((journey) => journey.id)).toEqual([
      "schedule_queue",
      "coverage_status",
      "digital_prescription",
      "hospital_capacity",
    ]);
    expect(journeys.every((journey) => journey.source.type === "demo")).toBe(true);
    expect(journeys.every((journey) => journey.actionMode === "demo_only")).toBe(true);
  });

  it("mantém a capacidade dependente de decisão humana e não determina encaminhamento", () => {
    const capacity = getPrototypeJourney("hospital_capacity");

    expect(capacity.detail).toMatch(/decisão humana/i);
    expect(capacity.blockedMessage).toMatch(/não confirma/i);
  });

  it("mostra estado de receita apenas como exemplo sem validar documento real", () => {
    const prescription = getPrototypeJourney("digital_prescription");

    expect(prescription.status).toMatch(/ilustrativo/i);
    expect(prescription.blockedMessage).toMatch(/não valida/i);
  });
});
