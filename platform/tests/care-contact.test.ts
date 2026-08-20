import { describe, expect, it } from "vitest";

import { createEncryptedCareContact, decryptCareContact, normalizeCarePhone } from "../server/care-contact";

describe("care contacts", () => {
  const input = {
    id: "contact-001",
    patientUserId: 7,
    name: "Dra. Ana Cuidado",
    phone: "+55 (11) 99876-1234",
    category: "healthcare" as const,
  };

  it("cifra nome e telefone e preserva somente um identificador opaco para deduplicação", () => {
    const stored = createEncryptedCareContact(input);

    expect(stored.nameCiphertext).not.toContain(input.name);
    expect(stored.phoneCiphertext).not.toContain(input.phone);
    expect(stored.contactFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(decryptCareContact(stored)).toMatchObject({
      id: input.id,
      name: input.name,
      phone: "+5511998761234",
      category: "healthcare",
    });
  });

  it("normaliza números equivalentes para o mesmo contato", () => {
    expect(normalizeCarePhone("+55 (11) 99876-1234")).toBe(normalizeCarePhone("5511998761234"));
  });

  it("recusa telefones curtos e entradas vazias", () => {
    expect(() => normalizeCarePhone("123")).toThrow("phone");
    expect(() => createEncryptedCareContact({ ...input, name: " " })).toThrow("name");
  });
});
