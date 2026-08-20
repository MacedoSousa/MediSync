export const PROTOTYPE_INSTITUTIONAL_JOURNEY_IDS = [
  "schedule_queue",
  "coverage_status",
  "digital_prescription",
  "hospital_capacity",
] as const;

export type PrototypeInstitutionalJourneyId = (typeof PROTOTYPE_INSTITUTIONAL_JOURNEY_IDS)[number];

export interface PrototypeInstitutionalJourney {
  id: PrototypeInstitutionalJourneyId;
  title: string;
  description: string;
  status: string;
  detail: string;
  source: { type: "demo"; label: "Demonstração MedSync" };
  actionMode: "demo_only";
  blockedMessage: string;
}

const DEMO_SOURCE = { type: "demo", label: "Demonstração MedSync" } as const;

export function createPrototypeInstitutionalJourneys(): readonly PrototypeInstitutionalJourney[] {
  return [
    {
      id: "schedule_queue",
      title: "Fila de agenda institucional",
      description: "Solicitações fictícias organizadas para demonstrar rastreabilidade e prioridade administrativa.",
      status: "Fila ilustrativa com 3 solicitações",
      detail: "Nenhuma solicitação é encaminhada, confirmada ou alterada fora do protótipo.",
      source: DEMO_SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este painel não cria, aprova ou cancela agendamentos reais.",
    },
    {
      id: "coverage_status",
      title: "Estado de cobertura",
      description: "Visualização fictícia de benefícios por convênio e SUS para explicar a experiência de consulta.",
      status: "Cobertura ilustrativa para demonstração",
      detail: "A elegibilidade efetiva depende da operadora, do contrato e da análise humana competente.",
      source: DEMO_SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este painel não consulta operadoras nem confirma qualquer cobertura real.",
    },
    {
      id: "digital_prescription",
      title: "Estado de receita digital",
      description: "Exemplo de como a origem e a vigência de uma receita poderão ser apresentadas.",
      status: "Estado ilustrativo: origem declarada",
      detail: "A verificação farmacêutica real exige fonte autorizada e procedimento próprio de validação.",
      source: DEMO_SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este painel não valida, aceita, rejeita ou dispensa documento real.",
    },
    {
      id: "hospital_capacity",
      title: "Capacidade hospitalar",
      description: "Indicador agregado fictício para demonstrar visualização regulatória de capacidade.",
      status: "Indicador ilustrativo: revisão humana necessária",
      detail: "A capacidade nunca determina rota assistencial: qualquer encaminhamento exige decisão humana e fonte oficial atualizada.",
      source: DEMO_SOURCE,
      actionMode: "demo_only",
      blockedMessage: "Este painel não confirma vaga, não classifica urgência e não encaminha pacientes.",
    },
  ] as const;
}

export function getPrototypeJourney(id: PrototypeInstitutionalJourneyId): PrototypeInstitutionalJourney {
  const journey = createPrototypeInstitutionalJourneys().find((candidate) => candidate.id === id);
  if (!journey) {
    throw new Error(`Jornada institucional demonstrativa não encontrada: ${id}`);
  }
  return journey;
}
