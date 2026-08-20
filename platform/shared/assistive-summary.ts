import type { DataProvenance, HealthTimelineEntry } from "./health-domain";

export const ASSISTIVE_SUMMARY_SCHEMA_VERSION = "medsync.assistive-summary.v1" as const;

export interface AssistiveSummaryItem {
  readonly recordId: string;
  readonly text: string;
  readonly evidence: readonly DataProvenance[];
}

export interface AssistiveSummary {
  readonly schemaVersion: typeof ASSISTIVE_SUMMARY_SCHEMA_VERSION;
  readonly patientId: string;
  readonly generatedAt: string;
  readonly disclaimer: string;
  readonly items: readonly AssistiveSummaryItem[];
}

export interface AssistiveSummaryCandidate extends Omit<AssistiveSummary, "schemaVersion"> {
  readonly schemaVersion?: typeof ASSISTIVE_SUMMARY_SCHEMA_VERSION;
}

const prohibitedClinicalTerms = [
  "diagnóstic", "diagnostic", "prognóst", "prognostic", "prescrev", "posologia", "dose", "dosagem", "tratamento", "cura",
] as const;

const disclaimer = "Este é um resumo assistivo de registros autorizados. Não fornece diagnóstico, prescrição, dose ou decisão clínica.";

function assertSafeAssistiveText(text: string) {
  const normalized = text.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) throw new Error("Assistive summary text is required.");
  if (prohibitedClinicalTerms.some((term) => normalized.includes(term))) {
    throw new Error("Prohibited clinical content in assistive summary.");
  }
}

function evidenceMatchesRecord(evidence: readonly DataProvenance[], record: HealthTimelineEntry) {
  return evidence.some((item) =>
    item.sourceType === record.provenance.sourceType &&
    item.sourceName === record.provenance.sourceName &&
    item.recordedAt === record.provenance.recordedAt &&
    item.externalReference === record.provenance.externalReference,
  );
}

/**
 * Valida uma resposta antes de ela ser apresentada. A IA só pode resumir
 * registros fornecidos e cada ponto precisa ser rastreável à sua origem.
 */
export function validateAssistiveSummary(
  candidate: AssistiveSummaryCandidate,
  authorizedRecords: readonly HealthTimelineEntry[],
): asserts candidate is AssistiveSummary {
  if (!candidate.patientId || !candidate.generatedAt || !candidate.disclaimer.trim()) {
    throw new Error("Assistive summary metadata is required.");
  }
  const recordsById = new Map(authorizedRecords.map((record) => [record.id, record]));
  for (const item of candidate.items) {
    const record = recordsById.get(item.recordId);
    if (!record || item.evidence.length === 0 || !evidenceMatchesRecord(item.evidence, record)) {
      throw new Error("Assistive summary item must include matching evidence.");
    }
    assertSafeAssistiveText(item.text);
  }
}

/** Fallback testável que não interpreta clinicamente o conteúdo dos registros. */
export function createAssistiveSummary(input: {
  patientId: string;
  records: readonly HealthTimelineEntry[];
  generatedAt: Date;
}): AssistiveSummary {
  const result: AssistiveSummary = {
    schemaVersion: ASSISTIVE_SUMMARY_SCHEMA_VERSION,
    patientId: input.patientId,
    generatedAt: input.generatedAt.toISOString(),
    disclaimer,
    items: input.records.map((record) => ({
      recordId: record.id,
      text: `Registro disponível: ${record.title.trim()}. Consulte a origem declarada para contexto.`,
      evidence: [record.provenance],
    })),
  };
  validateAssistiveSummary(result, input.records);
  return Object.freeze(result);
}
