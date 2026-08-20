export const demoServiceModalities = ["in_person", "telehealth"] as const;
export type DemoServiceModality = (typeof demoServiceModalities)[number];

export const demoAccessibilityOptions = ["mobility", "visual", "hearing"] as const;
export type DemoAccessibilityOption = (typeof demoAccessibilityOptions)[number];

export type DemoServiceDirectoryEntry = Readonly<{
  id: string;
  name: string;
  facilityName: string;
  specialty: string;
  municipalityLabel: string;
  modality: DemoServiceModality;
  acceptsSus: boolean;
  healthPlans: readonly string[];
  accessibility: readonly DemoAccessibilityOption[];
  availabilityLabel: string;
  actionMode: "demo_only";
  updatedAt: Date;
  source: Readonly<{
    id: "medsync-demo-directory";
    label: "Demonstração MedSync";
    type: "demo";
  }>;
}>;

export type DemoServiceDirectoryFilters = Readonly<{
  query?: string;
  specialty?: string;
  acceptsSus?: boolean;
  healthPlan?: string;
  modality?: DemoServiceModality;
  accessibility?: DemoAccessibilityOption;
}>;

const source = {
  id: "medsync-demo-directory",
  label: "Demonstração MedSync",
  type: "demo",
} as const;

const demoAvailability = "Demonstração — disponibilidade ilustrativa, sem confirmação de atendimento.";

/**
 * Dados fictícios para navegação e validação visual do protótipo.
 * Não representam profissionais, organizações, convênios ou ofertas reais.
 */
export function createDemoServiceDirectory(): readonly DemoServiceDirectoryEntry[] {
  return [
    {
      id: "demo-service-cardiology-center",
      name: "Profissional demonstrativo de Cardiologia",
      facilityName: "Centro de Saúde Demonstrativo",
      specialty: "Cardiologia",
      municipalityLabel: "Bairro Central — cidade ilustrativa",
      modality: "in_person",
      acceptsSus: true,
      healthPlans: ["Plano demonstrativo Essencial"],
      accessibility: ["mobility", "hearing"],
      availabilityLabel: demoAvailability,
      actionMode: "demo_only",
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      source,
    },
    {
      id: "demo-service-general-care-north",
      name: "Profissional demonstrativo de Clínica Médica",
      facilityName: "Unidade Demonstrativa Norte",
      specialty: "Clínica Médica",
      municipalityLabel: "Região Norte — cidade ilustrativa",
      modality: "in_person",
      acceptsSus: true,
      healthPlans: ["Plano demonstrativo Essencial", "Plano demonstrativo Familiar"],
      accessibility: ["mobility", "visual"],
      availabilityLabel: demoAvailability,
      actionMode: "demo_only",
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      source,
    },
    {
      id: "demo-service-pediatrics-online",
      name: "Profissional demonstrativo de Pediatria",
      facilityName: "Teleatendimento Demonstrativo",
      specialty: "Pediatria",
      municipalityLabel: "Atendimento remoto ilustrativo",
      modality: "telehealth",
      acceptsSus: false,
      healthPlans: ["Plano demonstrativo Familiar"],
      accessibility: ["hearing"],
      availabilityLabel: "Demonstração — fluxo visual de teleatendimento, sem chamada ou contato externo.",
      actionMode: "demo_only",
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      source,
    },
    {
      id: "demo-service-orthopedics-east",
      name: "Profissional demonstrativo de Ortopedia",
      facilityName: "Clínica Demonstrativa Leste",
      specialty: "Ortopedia",
      municipalityLabel: "Região Leste — cidade ilustrativa",
      modality: "in_person",
      acceptsSus: false,
      healthPlans: ["Plano demonstrativo Essencial"],
      accessibility: ["mobility"],
      availabilityLabel: demoAvailability,
      actionMode: "demo_only",
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      source,
    },
  ] as const;
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function searchDemoServiceDirectory(filters: DemoServiceDirectoryFilters = {}): readonly DemoServiceDirectoryEntry[] {
  const query = filters.query ? normalized(filters.query) : "";

  return createDemoServiceDirectory().filter((entry) => {
    const searchable = normalized([entry.name, entry.facilityName, entry.specialty, entry.municipalityLabel].join(" "));
    return (
      (!query || searchable.includes(query)) &&
      (!filters.specialty || entry.specialty === filters.specialty) &&
      (filters.acceptsSus === undefined || entry.acceptsSus === filters.acceptsSus) &&
      (!filters.healthPlan || entry.healthPlans.includes(filters.healthPlan)) &&
      (!filters.modality || entry.modality === filters.modality) &&
      (!filters.accessibility || entry.accessibility.includes(filters.accessibility))
    );
  });
}
