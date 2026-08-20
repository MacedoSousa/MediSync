import { describe, expect, it } from "vitest";

import {
  createDemoContactScenarios,
  createDemoPharmacyOffers,
  createDemoVigencyAlerts,
} from "../shared/testing/prototype-service-experiences";

describe("experiências de serviço do protótipo", () => {
  it("mantém contato e teleatendimento como cenários visuais sem canal externo", () => {
    const scenarios = createDemoContactScenarios();

    expect(scenarios.length).toBeGreaterThanOrEqual(2);
    expect(scenarios.every((scenario) => scenario.actionMode === "demo_only")).toBe(true);
    expect(scenarios.every((scenario) => scenario.source.type === "demo")).toBe(true);
    expect(scenarios.some((scenario) => scenario.kind === "telehealth")).toBe(true);
  });

  it("exibe ofertas farmacêuticas fictícias com vigência, sem compra, reserva ou orientação de dose", () => {
    const offers = createDemoPharmacyOffers();

    expect(offers.length).toBeGreaterThanOrEqual(3);
    expect(offers.every((offer) => offer.actionMode === "demo_only")).toBe(true);
    expect(offers.every((offer) => offer.source.label === "Demonstração MedSync")).toBe(true);
    expect(offers.every((offer) => offer.validUntil instanceof Date)).toBe(true);
    expect(offers.some((offer) => /dose|mg/i.test(offer.title))).toBe(false);
  });

  it("fornece alertas informativos de datas, sem renovar receita, confirmar cobertura ou inferir conduta clínica", () => {
    const alerts = createDemoVigencyAlerts();

    expect(alerts.length).toBeGreaterThanOrEqual(3);
    expect(alerts.every((alert) => ["appointment", "consent", "benefit", "document"].includes(alert.kind))).toBe(true);
    expect(alerts.every((alert) => alert.actionMode === "demo_only")).toBe(true);
    expect(alerts.every((alert) => alert.message.includes("Demonstração"))).toBe(true);
  });
});
