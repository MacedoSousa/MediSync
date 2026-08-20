import { describe, expect, it } from "vitest";

import { hasValidNativeSession } from "../shared/auth/session-safety";

const identity = { id: 1, openId: "demo-open-id" };

describe("hasValidNativeSession", () => {
  it("não autentica uma identidade em cache sem token seguro", () => {
    expect(hasValidNativeSession(null, identity)).toBe(false);
  });

  it("não autentica um token sem identidade associada", () => {
    expect(hasValidNativeSession("secure-token", null)).toBe(false);
  });

  it("autentica somente quando token e identidade estão presentes", () => {
    expect(hasValidNativeSession("secure-token", identity)).toBe(true);
  });
});
