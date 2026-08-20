export const medicationIntakeStatuses = ["taken", "not_taken", "needs_help"] as const;
export type MedicationIntakeStatus = (typeof medicationIntakeStatuses)[number];

export interface MedicationIntakeLogInput {
  id: string;
  patientUserId: number;
  actorUserId: number;
  medicationPlanReference: string;
  status: MedicationIntakeStatus;
  occurredAt: Date;
  recordedAt: Date;
  idempotencyKey: string;
  correctionOfId?: string;
}

export type MedicationIntakeLog = Readonly<MedicationIntakeLogInput>;

export function createMedicationIntakeLog(input: MedicationIntakeLogInput): MedicationIntakeLog {
  if (!input.id.trim() || input.patientUserId <= 0 || input.actorUserId <= 0) {
    throw new Error("Medication intake identity is required.");
  }
  if (!input.medicationPlanReference.trim()) throw new Error("Medication plan reference is required.");
  if (!input.idempotencyKey.trim()) throw new Error("Medication intake idempotency key is required.");
  if (Number.isNaN(input.occurredAt.getTime()) || Number.isNaN(input.recordedAt.getTime())) {
    throw new Error("Medication intake timestamps must be valid.");
  }
  if (input.occurredAt.getTime() > input.recordedAt.getTime() + 5 * 60 * 1000) {
    throw new Error("Medication intake cannot be recorded before it occurs.");
  }
  return Object.freeze({ ...input, medicationPlanReference: input.medicationPlanReference.trim(), idempotencyKey: input.idempotencyKey.trim() });
}
