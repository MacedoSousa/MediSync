import { describe, expect, it } from "vitest";

import {
  ASSISTIVE_TRANSPARENCY,
  canGenerateAssistiveSummary,
  normalizeAssistivePreference,
} from "../shared/assistive-transparency";

describe("transparência da IA assistiva", () => {
  it("declara os dados usados, limites clínicos e a contingência independente", () => {
    expect(ASSISTIVE_TRANSPARENCY.dataUse).toContain("Registros autorizados e sua proveniência declarada.");
    expect(ASSISTIVE_TRANSPARENCY.prohibitedCapabilities).toContain("Diagnóstico, triagem, prescrição ou cálculo de dose.");
    expect(ASSISTIVE_TRANSPARENCY.emergencyFallback).toMatch(/SAMU 192/i);
  });

  it("impede nova geração quando a pessoa revoga a preferência e normaliza apenas booleanos", () => {
    expect(canGenerateAssistiveSummary({ userEnabled: true, agentEnabled: true })).toBe(true);
    expect(canGenerateAssistiveSummary({ userEnabled: false, agentEnabled: true })).toBe(false);
    expect(normalizeAssistivePreference(true)).toBe(true);
    expect(() => normalizeAssistivePreference("sim")).toThrow(/boolean/i);
  });
});
