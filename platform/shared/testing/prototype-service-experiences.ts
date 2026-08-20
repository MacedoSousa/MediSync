export type PrototypeDemoSource = Readonly<{
  id: "medsync-demo-services";
  label: "Demonstração MedSync";
  type: "demo";
}>;

export type DemoContactScenario = Readonly<{
  id: string;
  kind: "telehealth" | "direct_contact";
  title: string;
  description: string;
  actionMode: "demo_only";
  source: PrototypeDemoSource;
}>;

export type DemoPharmacyOffer = Readonly<{
  id: string;
  title: string;
  pharmacyLabel: string;
  benefitLabel: string;
  validUntil: Date;
  actionMode: "demo_only";
  source: PrototypeDemoSource;
}>;

export type DemoVigencyAlert = Readonly<{
  id: string;
  kind: "appointment" | "consent" | "benefit" | "document";
  title: string;
  message: string;
  dueAt: Date;
  actionMode: "demo_only";
  source: PrototypeDemoSource;
}>;

const source: PrototypeDemoSource = {
  id: "medsync-demo-services",
  label: "Demonstração MedSync",
  type: "demo",
};

/** Cenários somente visuais. Não iniciam chamadas, mensagens, pagamentos, reservas ou dispensação. */
export function createDemoContactScenarios(): readonly DemoContactScenario[] {
  return [
    {
      id: "demo-contact-telehealth",
      kind: "telehealth",
      title: "Teleatendimento demonstrativo",
      description: "Fluxo visual de sala de espera. Nenhuma câmera, áudio, chamada ou contato externo é iniciado neste protótipo.",
      actionMode: "demo_only",
      source,
    },
    {
      id: "demo-contact-service",
      kind: "direct_contact",
      title: "Contato institucional demonstrativo",
      description: "Exemplo de disponibilidade informada. O protótipo não exibe número, e-mail, mensagem ou estabelecimento real.",
      actionMode: "demo_only",
      source,
    },
  ] as const;
}

/** Ofertas fictícias para demonstrar a experiência comercial sem publicidade baseada em dados clínicos. */
export function createDemoPharmacyOffers(): readonly DemoPharmacyOffer[] {
  return [
    {
      id: "demo-pharmacy-wellness",
      title: "Oferta ilustrativa de bem-estar",
      pharmacyLabel: "Farmácia demonstrativa Centro",
      benefitLabel: "Condição fictícia válida apenas para a demonstração",
      validUntil: new Date("2026-09-05T23:59:59.000Z"),
      actionMode: "demo_only",
      source,
    },
    {
      id: "demo-pharmacy-care",
      title: "Benefício ilustrativo de cuidados pessoais",
      pharmacyLabel: "Farmácia demonstrativa Norte",
      benefitLabel: "Preço, estoque e elegibilidade não são consultados neste protótipo",
      validUntil: new Date("2026-09-12T23:59:59.000Z"),
      actionMode: "demo_only",
      source,
    },
    {
      id: "demo-pharmacy-accessibility",
      title: "Oferta ilustrativa de itens de acessibilidade",
      pharmacyLabel: "Farmácia demonstrativa Leste",
      benefitLabel: "Exemplo de vigência; não cria compra, reserva ou entrega",
      validUntil: new Date("2026-09-19T23:59:59.000Z"),
      actionMode: "demo_only",
      source,
    },
  ] as const;
}

/** Lembretes neutros de calendário; não avaliam validade clínica, renovação ou cobertura. */
export function createDemoVigencyAlerts(): readonly DemoVigencyAlert[] {
  return [
    {
      id: "demo-vigency-appointment",
      kind: "appointment",
      title: "Lembrete de agenda ilustrativo",
      message: "Demonstração — confira a data exibida no cenário. Nenhuma consulta real foi confirmada.",
      dueAt: new Date("2026-09-03T13:30:00.000Z"),
      actionMode: "demo_only",
      source,
    },
    {
      id: "demo-vigency-consent",
      kind: "consent",
      title: "Revisão de consentimento ilustrativa",
      message: "Demonstração — cenário de vigência de consentimento; não altera preferências reais.",
      dueAt: new Date("2026-09-10T12:00:00.000Z"),
      actionMode: "demo_only",
      source,
    },
    {
      id: "demo-vigency-benefit",
      kind: "benefit",
      title: "Término de benefício ilustrativo",
      message: "Demonstração — a condição comercial é fictícia e não permite compra, reserva ou desconto real.",
      dueAt: new Date("2026-09-12T23:59:59.000Z"),
      actionMode: "demo_only",
      source,
    },
  ] as const;
}
