import type { SyntheticHealthScenario, SyntheticTimelineEntry } from "./testing/synthetic-health-fixtures";

export interface SyntheticRecordAttachment {
  id: string;
  title: string;
  mimeType: "application/pdf";
  availability: "not_connected";
  isSynthetic: true;
}

export interface SyntheticHealthRecordDetail extends SyntheticTimelineEntry {
  isSynthetic: true;
  summary: string;
  attachments: readonly SyntheticRecordAttachment[];
}

export function getSyntheticHealthRecordDetail(
  scenario: SyntheticHealthScenario,
  patientId: string,
  recordId: string,
): SyntheticHealthRecordDetail | undefined {
  const entry = scenario.timeline.find((candidate) => candidate.id === recordId && candidate.patientId === patientId);
  if (!entry) return undefined;

  return {
    ...entry,
    isSynthetic: true,
    summary: "Conteúdo de demonstração. Nenhuma conclusão clínica, prescrição ou documento real está disponível nesta tela.",
    attachments: entry.category === "document"
      ? [{
          id: `${entry.id}-attachment`,
          title: "Anexo de demonstração",
          mimeType: "application/pdf",
          availability: "not_connected",
          isSynthetic: true,
        }]
      : [],
  };
}
