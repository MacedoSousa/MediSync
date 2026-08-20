import { describe, expect, it } from "vitest";

import { validateClinicalImport } from "../shared/clinical-import-contract";

const validRecord = {
  schemaVersion: "medsync.clinical-import.v1",
  sourceSystemId: "partner-clinic-001",
  record: {
    externalReference: "encounter-123",
    patientExternalReference: "patient-456",
    category: "consultation" as const,
    title: "Consulta registrada pela fonte parceira",
    occurredAt: "2026-08-01T10:00:00.000Z",
    provenance: {
      sourceType: "verified_partner" as const,
      sourceName: "Clínica parceira homologada",
      recordedAt: "2026-08-01T10:15:00.000Z",
      externalReference: "encounter-123",
    },
  },
};

describe("clinical import contract", () => {
  it("aceita registros versionados de parceiros com proveniência verificável", () => {
    expect(validateClinicalImport(validRecord)).toMatchObject({ accepted: true, externalReference: "encounter-123" });
  });

  it("recusa fontes sem referência externa ou provenientes de autorrelato", () => {
    expect(() => validateClinicalImport({ ...validRecord, record: { ...validRecord.record, externalReference: "" } })).toThrow("external reference");
    expect(() => validateClinicalImport({ ...validRecord, record: { ...validRecord.record, provenance: { ...validRecord.record.provenance, sourceType: "patient_reported" } } })).toThrow("source");
  });
});
