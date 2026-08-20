import type { DataProvenance } from "./health-domain";

export interface MedicationPlanInput {
  id: string;
  patientId: string;
  displayName: string;
  /** Texto literal registrado pela fonte. Nunca é derivado, resumido ou reescrito pelo MedSync. */
  instructionFromSource: string;
  sourceRecordReference: string;
  provenance: DataProvenance;
  isSynthetic: boolean;
}

export type MedicationPlan = Readonly<MedicationPlanInput>;

export interface MedicationPlanView {
  id: string;
  displayName: string;
  instruction: string;
  sourceLabel: string;
  canChangeDose: false;
  isSynthetic: boolean;
}

export function createMedicationPlan(input: MedicationPlanInput): MedicationPlan {
  if (!input.id.trim() || !input.patientId.trim() || !input.displayName.trim()) throw new Error("Medication plan identity is required.");
  if (!input.instructionFromSource.trim()) throw new Error("Medication plan instruction from source is required.");
  if (!input.sourceRecordReference.trim()) throw new Error("Medication plan source reference is required.");
  if (!input.provenance.sourceName.trim() || !input.provenance.recordedAt || !input.provenance.externalReference?.trim()) {
    throw new Error("Medication plan provenance is incomplete.");
  }
  return Object.freeze({ ...input, displayName: input.displayName.trim(), instructionFromSource: input.instructionFromSource.trim() });
}

export function medicationPlanView(plan: MedicationPlan): MedicationPlanView {
  return Object.freeze({
    id: plan.id,
    displayName: plan.displayName,
    instruction: plan.instructionFromSource,
    sourceLabel: `${plan.provenance.sourceName} — instrução registrada`,
    canChangeDose: false,
    isSynthetic: plan.isSynthetic,
  });
}

export function createSyntheticMedicationPlans(): readonly MedicationPlan[] {
  const source: DataProvenance = {
    sourceType: "clinical_system",
    sourceName: "Ambiente de demonstração MedSync",
    recordedAt: "2026-08-01T08:00:00.000Z",
    externalReference: "demo-prescription-001",
  };
  return [createMedicationPlan({
    id: "demo-medication-plan-001",
    patientId: "demo-patient-001",
    displayName: "Medicamento de demonstração",
    instructionFromSource: "Instrução fictícia registrada na fonte de demonstração.",
    sourceRecordReference: "demo-prescription-001",
    provenance: source,
    isSynthetic: true,
  })];
}
