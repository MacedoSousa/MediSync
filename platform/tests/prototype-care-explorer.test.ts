import { describe, expect, it } from "vitest";

import {
  createPrototypeAppointmentRequests,
  createPrototypePharmacyCatalog,
  createPrototypeVigencyDetails,
  filterPrototypePharmacyCatalog,
} from "../shared/testing/prototype-care-explorer";

describe("explorador assistencial demonstrativo", () => {
  it("expõe solicitações de agenda com origem e sem confirmação real", () => {
    const requests = createPrototypeAppointmentRequests();

    expect(requests).toHaveLength(2);
    expect(requests.every((request) => request.source.type === "demo")).toBe(true);
    expect(requests.every((request) => request.actionMode === "demo_only")).toBe(true);
  });

  it("mantém medicamentos somente como rótulos sintéticos sem dose, orientação ou compra", () => {
    const catalog = createPrototypePharmacyCatalog();
    const medicines = filterPrototypePharmacyCatalog(catalog, "medicine");

    expect(medicines).toHaveLength(2);
    expect(medicines.every((item) => item.title.includes("ilustrativo"))).toBe(true);
    expect(medicines.every((item) => /não permite compra/i.test(item.blockedMessage))).toBe(true);
    expect(medicines.some((item) => /mg|ml|dose/i.test(item.description))).toBe(false);
  });

  it("expõe detalhes de vigência sem renovar ou alterar consentimentos e documentos", () => {
    const details = createPrototypeVigencyDetails();

    expect(details.every((detail) => detail.actionMode === "demo_only")).toBe(true);
    expect(details.every((detail) => detail.blockedMessage.length > 0)).toBe(true);
  });
});
