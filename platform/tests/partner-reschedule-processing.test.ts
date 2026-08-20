import { describe, expect, it } from "vitest";

import { decidePartnerRescheduleUpdate } from "../shared/partner-reschedule-processing";

describe("decidePartnerRescheduleUpdate", () => {
  it("permite uma transição válida enviada pelo parceiro", () => {
    expect(decidePartnerRescheduleUpdate("requested", "under_review")).toEqual({ decision: "apply" });
  });

  it("trata o mesmo estado como reprocessamento idempotente", () => {
    expect(decidePartnerRescheduleUpdate("under_review", "under_review")).toEqual({ decision: "ignore" });
  });

  it("rejeita transição incompatível com a máquina de estados", () => {
    expect(() => decidePartnerRescheduleUpdate("requested", "completed")).toThrow(/invalid/i);
    expect(() => decidePartnerRescheduleUpdate("completed", "under_review")).toThrow(/invalid/i);
  });
});
