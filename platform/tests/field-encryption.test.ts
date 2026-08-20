import { describe, expect, it } from "vitest";

import { decryptSensitiveField, encryptSensitiveField, getFieldEncryptionKey } from "../server/field-encryption";

describe("field encryption", () => {
  it("aceita a chave configurada e protege um campo sensível em ida e volta", () => {
    expect(getFieldEncryptionKey()).toHaveLength(32);

    const encrypted = encryptSensitiveField("Contato de cuidado", "contato-001");

    expect(encrypted).not.toContain("Contato de cuidado");
    expect(decryptSensitiveField(encrypted, "contato-001")).toBe("Contato de cuidado");
  });
});
