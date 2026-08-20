export type PrototypeCareSource = Readonly<{
  type: "demo";
  label: "Demonstração MedSync";
}>;

export type PrototypeAppointmentRequest = Readonly<{
  id: string;
  specialty: string;
  availabilityLabel: string;
  source: PrototypeCareSource;
  actionMode: "demo_only";
  blockedMessage: string;
}>;

export type PrototypePharmacyCategory = "medicine" | "wellness" | "accessibility";

export type PrototypePharmacyCatalogItem = Readonly<{
  id: string;
  category: PrototypePharmacyCategory;
  title: string;
  description: string;
  pharmacyLabel: string;
  validUntil: Date;
  source: PrototypeCareSource;
  actionMode: "demo_only";
  blockedMessage: string;
}>;

export type PrototypeVigencyDetail = Readonly<{
  id: string;
  title: string;
  dueAt: Date;
  detail: string;
  source: PrototypeCareSource;
  actionMode: "demo_only";
  blockedMessage: string;
}>;

const SOURCE = { type: "demo", label: "Demonstração MedSync" } as const;

export function createPrototypeAppointmentRequests(): readonly PrototypeAppointmentRequest[] {
  return [
    {
      id: "demo-request-clinical",
      specialty: "Clínica geral ilustrativa",
      availabilityLabel: "Janela de agenda fictícia — revisão de fonte necessária",
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "O protótipo não solicita, confirma, agenda ou reagenda consultas reais.",
    },
    {
      id: "demo-request-specialty",
      specialty: "Especialidade ilustrativa",
      availabilityLabel: "Horário meramente visual — sem reserva",
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "O protótipo não solicita, confirma, agenda ou reagenda consultas reais.",
    },
  ] as const;
}

export function createPrototypePharmacyCatalog(): readonly PrototypePharmacyCatalogItem[] {
  return [
    {
      id: "demo-medicine-a",
      category: "medicine",
      title: "Medicamento ilustrativo A",
      description: "Rótulo fictício somente para testar pesquisa de catálogo; não representa produto, indicação ou orientação de uso.",
      pharmacyLabel: "Farmácia demonstrativa Centro",
      validUntil: new Date("2026-09-05T23:59:59.000Z"),
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este rótulo não permite compra, reserva, entrega, dispensação ou orientação clínica.",
    },
    {
      id: "demo-medicine-b",
      category: "medicine",
      title: "Medicamento ilustrativo B",
      description: "Rótulo fictício somente para testar filtros; a existência, preço e estoque não são consultados.",
      pharmacyLabel: "Farmácia demonstrativa Norte",
      validUntil: new Date("2026-09-12T23:59:59.000Z"),
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este rótulo não permite compra, reserva, entrega, dispensação ou orientação clínica.",
    },
    {
      id: "demo-wellness",
      category: "wellness",
      title: "Item de bem-estar ilustrativo",
      description: "Cenário visual de benefício fictício sem publicidade baseada em dados de saúde.",
      pharmacyLabel: "Farmácia demonstrativa Centro",
      validUntil: new Date("2026-09-05T23:59:59.000Z"),
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este item não permite compra, reserva, entrega ou desconto real.",
    },
    {
      id: "demo-accessibility",
      category: "accessibility",
      title: "Item de acessibilidade ilustrativo",
      description: "Cenário visual de catálogo inclusivo, sem produto, preço, estoque ou disponibilidade reais.",
      pharmacyLabel: "Farmácia demonstrativa Leste",
      validUntil: new Date("2026-09-19T23:59:59.000Z"),
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este item não permite compra, reserva, entrega ou desconto real.",
    },
  ] as const;
}

export function filterPrototypePharmacyCatalog(
  catalog: readonly PrototypePharmacyCatalogItem[],
  category: PrototypePharmacyCategory | "all",
): readonly PrototypePharmacyCatalogItem[] {
  return category === "all" ? catalog : catalog.filter((item) => item.category === category);
}

export function createPrototypeVigencyDetails(): readonly PrototypeVigencyDetail[] {
  return [
    {
      id: "demo-vigency-consent-detail",
      title: "Consentimento ilustrativo",
      dueAt: new Date("2026-09-10T12:00:00.000Z"),
      detail: "Exemplo de lembrete de revisão de autorização, sem alterar preferências ou compartilhamentos reais.",
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este cenário não renova, revoga nem cria consentimentos reais.",
    },
    {
      id: "demo-vigency-document-detail",
      title: "Documento ilustrativo",
      dueAt: new Date("2026-09-16T12:00:00.000Z"),
      detail: "Exemplo de data exibida para demonstrar transparência de vigência documental.",
      source: SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este cenário não valida, atualiza ou aceita documentos reais.",
    },
  ] as const;
}
