import { describe, expect, it } from "vitest";

import { buildEmergencyContingency, EMERGENCY_PHONE_NUMBER } from "../shared/emergency-contingency";

describe("emergency contingency", () => {
  it("fornece um caminho local para o SAMU sem invocar IA", () => {
    const contingency = buildEmergencyContingency({ aiAvailable: false, networkAvailable: false });

    expect(EMERGENCY_PHONE_NUMBER).toBe("192");
    expect(contingency.phoneUri).toBe("tel:192");
    expect(contingency.requiresAi).toBe(false);
    expect(contingency.requiresNetwork).toBe(false);
    expect(contingency.message).toMatch(/emergência/i);
  });
});
