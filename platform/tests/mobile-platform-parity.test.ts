import { describe, expect, it } from "vitest";

import {
  getSafeAreaTopCompensation,
  shouldConfigureLocalReminder,
  shouldTriggerTabHaptic,
} from "../shared/mobile-platform-parity";

describe("paridade de plataforma móvel", () => {
  it("protege a área superior do iOS quando o inset nativo não estiver disponível", () => {
    expect(getSafeAreaTopCompensation("ios", 0)).toBe(56);
    expect(getSafeAreaTopCompensation("ios", 24)).toBe(0);
    expect(getSafeAreaTopCompensation("android", 0)).toBe(0);
  });

  it("mantém haptics e notificações locais exclusivos dos ambientes nativos compatíveis", () => {
    expect(shouldTriggerTabHaptic("ios")).toBe(true);
    expect(shouldTriggerTabHaptic("android")).toBe(false);
    expect(shouldConfigureLocalReminder("ios")).toBe(true);
    expect(shouldConfigureLocalReminder("android")).toBe(true);
    expect(shouldConfigureLocalReminder("web")).toBe(false);
  });
});
