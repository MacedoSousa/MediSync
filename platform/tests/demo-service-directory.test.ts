import { describe, expect, it } from "vitest";

import {
  createDemoServiceDirectory,
  searchDemoServiceDirectory,
} from "../shared/testing/demo-service-directory";

describe("diretório demonstrativo de serviços", () => {
  it("fornece itens exclusivamente sintéticos, datados e bloqueados para ações externas", () => {
    const entries = createDemoServiceDirectory();

    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(entries.every((entry) => entry.source.type === "demo")).toBe(true);
    expect(entries.every((entry) => entry.source.label === "Demonstração MedSync")).toBe(true);
    expect(entries.every((entry) => entry.actionMode === "demo_only")).toBe(true);
    expect(entries.every((entry) => entry.updatedAt instanceof Date)).toBe(true);
  });

  it("filtra por busca, especialidade, SUS, convênio, modalidade e acessibilidade sem prometer disponibilidade real", () => {
    const results = searchDemoServiceDirectory({
      query: "cardio",
      specialty: "Cardiologia",
      acceptsSus: true,
      healthPlan: "Plano demonstrativo Essencial",
      modality: "in_person",
      accessibility: "mobility",
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      specialty: "Cardiologia",
      acceptsSus: true,
      actionMode: "demo_only",
      availabilityLabel: expect.stringContaining("Demonstração"),
    });
  });

  it("retorna vazio de forma explícita quando nenhum filtro encontra uma fonte demonstrativa", () => {
    expect(searchDemoServiceDirectory({ specialty: "Neurologia" })).toEqual([]);
  });
});
