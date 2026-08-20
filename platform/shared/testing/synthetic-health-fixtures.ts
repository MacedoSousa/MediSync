import type {
  DataProvenance,
  ExplainableHealthAlert,
  HealthTimelineEntry,
} from "../health-domain";

export const SYNTHETIC_DATA_NOTICE =
  "Dados de demonstração: conteúdo fictício, criado somente para validar a experiência do MedSync.";

export interface SyntheticDataProvenance extends DataProvenance {
  readonly isSynthetic: true;
  readonly generatedFor: "demonstration";
}

export type SyntheticTimelineEntry = Omit<HealthTimelineEntry, "provenance"> & {
  provenance: SyntheticDataProvenance;
};

export type SyntheticHealthAlert = Omit<ExplainableHealthAlert, "evidence"> & {
  evidence: SyntheticDataProvenance[];
};

export interface SyntheticHealthScenario {
  readonly notice: typeof SYNTHETIC_DATA_NOTICE;
  readonly patient: {
    readonly id: "demo-patient-001";
    readonly displayName: "Pessoa de demonstração";
  };
  readonly timeline: SyntheticTimelineEntry[];
  readonly alerts: SyntheticHealthAlert[];
}

const demoProvenance = (
  externalReference: string,
  recordedAt: string,
): SyntheticDataProvenance => ({
  sourceType: "clinical_system",
  sourceName: "Ambiente de demonstração MedSync",
  recordedAt,
  externalReference,
  isSynthetic: true,
  generatedFor: "demonstration",
});

export function createSyntheticHealthScenario(): SyntheticHealthScenario {
  const consultationProvenance = demoProvenance("demo-consultation-001", "2026-01-15T10:00:00.000Z");
  const documentProvenance = demoProvenance("demo-document-001", "2026-02-01T14:30:00.000Z");
  const resultProvenance = demoProvenance("demo-result-001", "2026-02-04T09:20:00.000Z");
  const imageProvenance = demoProvenance("demo-image-001", "2026-02-06T16:10:00.000Z");

  return {
    notice: SYNTHETIC_DATA_NOTICE,
    patient: {
      id: "demo-patient-001",
      displayName: "Pessoa de demonstração",
    },
    timeline: [
      {
        id: "demo-timeline-001",
        patientId: "demo-patient-001",
        category: "consultation",
        title: "Consulta de demonstração",
        occurredAt: "2026-01-15T10:00:00.000Z",
        provenance: consultationProvenance,
      },
      {
        id: "demo-timeline-002",
        patientId: "demo-patient-001",
        category: "document",
        title: "Documento de demonstração",
        occurredAt: "2026-02-01T14:30:00.000Z",
        provenance: documentProvenance,
      },
      {
        id: "demo-timeline-003",
        patientId: "demo-patient-001",
        category: "exam",
        title: "Resultado ilustrativo de exame",
        occurredAt: "2026-02-04T09:20:00.000Z",
        provenance: resultProvenance,
      },
      {
        id: "demo-timeline-004",
        patientId: "demo-patient-001",
        category: "exam",
        title: "Imagem ilustrativa de exame",
        occurredAt: "2026-02-06T16:10:00.000Z",
        provenance: imageProvenance,
      },
    ],
    alerts: [
      {
        id: "demo-alert-001",
        patientId: "demo-patient-001",
        priority: "information",
        title: "Exemplo de alerta assistivo",
        explanation:
          "Este é um exemplo fictício para validar a visualização de origem, contexto e ação segura.",
        safeAction: "review_record",
        evidence: [consultationProvenance, documentProvenance, resultProvenance, imageProvenance],
        generatedAt: "2026-02-01T14:35:00.000Z",
        ruleVersion: "demo-rule-v1",
      },
    ],
  };
}

export function isSyntheticHealthData(
  provenance: DataProvenance | SyntheticDataProvenance,
): provenance is SyntheticDataProvenance {
  return "isSynthetic" in provenance && provenance.isSynthetic === true && provenance.generatedFor === "demonstration";
}
