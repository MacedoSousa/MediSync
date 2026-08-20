import { describe, expect, it } from "vitest";

import {
  PROTOTYPE_PORTAL_ROLES,
  getPrototypePortal,
  isPrototypePortalRole,
} from "../shared/testing/prototype-access-portals";

describe("portais demonstrativos segregados", () => {
  it("expõe os oito papéis previstos sem misturar permissões institucionais reais", () => {
    expect(PROTOTYPE_PORTAL_ROLES.map((portal) => portal.id)).toEqual([
      "patient",
      "caregiver",
      "professional",
      "organization",
      "pharmacy",
      "operator",
      "regulation",
      "administration",
    ]);
    expect(PROTOTYPE_PORTAL_ROLES.every((portal) => portal.isSynthetic && portal.externalActionsBlocked)).toBe(true);
  });

  it("mantém o escopo mínimo do papel e inclui aviso de demonstração", () => {
    const pharmacy = getPrototypePortal("pharmacy");

    expect(pharmacy.scope).toContain("Ofertas ilustrativas");
    expect(pharmacy.scope).not.toContain("dispensar");
    expect(pharmacy.blockedMessage).toMatch(/nenhuma ação externa/i);
  });

  it("aceita somente identificadores de papel do contrato", () => {
    expect(isPrototypePortalRole("caregiver")).toBe(true);
    expect(isPrototypePortalRole("super-admin")).toBe(false);
  });
});
