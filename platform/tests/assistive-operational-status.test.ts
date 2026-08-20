import { describe, expect, it } from "vitest";

import { deriveAssistiveOperationalStatus } from "../shared/assistive-operational-status";

describe("assistive operational status", () => {
  it("informa disponibilidade com fallback determinístico quando preferência e governança permitem", () => {
    expect(deriveAssistiveOperationalStatus({ userEnabled: true, governanceEnabled: true })).toMatchObject({
      state: "available_with_fallback",
      canGenerate: true,
      emergencyContingencyIndependent: true,
      usesExternalContact: false,
    });
  });

  it("bloqueia geração quando a preferência individual estiver revogada, sem afetar contingência", () => {
    expect(deriveAssistiveOperationalStatus({ userEnabled: false, governanceEnabled: true })).toMatchObject({
      state: "disabled_by_preference",
      canGenerate: false,
      emergencyContingencyIndependent: true,
    });
  });

  it("bloqueia geração quando a governança desabilitar o agente, sem iniciar ação clínica ou externa", () => {
    expect(deriveAssistiveOperationalStatus({ userEnabled: true, governanceEnabled: false })).toMatchObject({
      state: "disabled_by_governance",
      canGenerate: false,
      startsClinicalAction: false,
      usesExternalContact: false,
    });
  });
});
