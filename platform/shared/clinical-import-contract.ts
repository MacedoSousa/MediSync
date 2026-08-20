import type { DataProvenance, HealthTimelineEntry } from "./health-domain";

export const CLINICAL_IMPORT_SCHEMA_VERSION = "medsync.clinical-import.v1" as const;
const importableCategories = ["consultation", "exam", "medication", "document"] as const;

export interface ClinicalImportRecord {
  externalReference: string;
  patientExternalReference: string;
  category: (typeof importableCategories)[number];
  title: string;
  occurredAt: string;
  provenance: DataProvenance;
}

export interface ClinicalImportEnvelope {
  schemaVersion: string;
  sourceSystemId: string;
  record: ClinicalImportRecord;
}

export interface AcceptedClinicalImport {
  readonly accepted: true;
  readonly externalReference: string;
  readonly sourceSystemId: string;
}

/**
 * Contrato de borda. A ingestão real dependerá de parceiro homologado, autenticação
 * mútua e verificação de autorização antes de persistir qualquer dado clínico.
 */
export function validateClinicalImport(envelope: ClinicalImportEnvelope): AcceptedClinicalImport {
  if (envelope.schemaVersion !== CLINICAL_IMPORT_SCHEMA_VERSION) throw new Error("Unsupported clinical import schema version.");
  if (!envelope.sourceSystemId.trim()) throw new Error("Clinical import source system is required.");
  if (!envelope.record.externalReference.trim()) throw new Error("Clinical import external reference is required.");
  if (!envelope.record.patientExternalReference.trim()) throw new Error("Clinical import patient reference is required.");
  if (!importableCategories.includes(envelope.record.category)) throw new Error("Clinical import category is invalid.");
  if (!envelope.record.title.trim()) throw new Error("Clinical import title is required.");
  if (Number.isNaN(Date.parse(envelope.record.occurredAt)) || Number.isNaN(Date.parse(envelope.record.provenance.recordedAt))) {
    throw new Error("Clinical import dates must be valid ISO timestamps.");
  }
  if (envelope.record.provenance.sourceType !== "clinical_system" && envelope.record.provenance.sourceType !== "verified_partner") {
    throw new Error("Clinical import source is not authorized for clinical confirmation.");
  }
  if (!envelope.record.provenance.sourceName.trim() || !envelope.record.provenance.externalReference?.trim()) {
    throw new Error("Clinical import provenance is incomplete.");
  }
  if (envelope.record.provenance.externalReference !== envelope.record.externalReference) {
    throw new Error("Clinical import provenance reference does not match the record.");
  }
  return Object.freeze({ accepted: true, externalReference: envelope.record.externalReference, sourceSystemId: envelope.sourceSystemId });
}

export function toImportedTimelineEntry(input: ClinicalImportEnvelope, patientId: string): HealthTimelineEntry {
  validateClinicalImport(input);
  return {
    id: `${input.sourceSystemId}:${input.record.externalReference}`,
    patientId,
    category: input.record.category,
    title: input.record.title.trim(),
    occurredAt: input.record.occurredAt,
    provenance: input.record.provenance,
  };
}
