export const rescheduleRequestStatuses = [
  "requested",
  "under_review",
  "options_received",
  "completed",
  "declined",
  "withdrawn",
] as const;

export type RescheduleRequestStatus = (typeof rescheduleRequestStatuses)[number];

export interface RescheduleRequestSource {
  label: string;
  receivedAt: Date;
  type: "demo" | "partner_api" | "manual_verified";
}

export interface RescheduleRequestInput {
  id: string;
  patientUserId: number;
  appointmentId: string;
  idempotencyKey: string;
  requestedAt: Date;
  source: RescheduleRequestSource;
}

export interface RescheduleRequest extends RescheduleRequestInput {
  status: "requested";
}

const allowedTransitions: Record<RescheduleRequestStatus, readonly RescheduleRequestStatus[]> = {
  requested: ["under_review", "options_received", "declined", "withdrawn"],
  under_review: ["options_received", "declined", "withdrawn"],
  options_received: ["completed", "declined", "withdrawn"],
  completed: [],
  declined: [],
  withdrawn: [],
};

/** Solicitar reagendamento não muda o estado de uma consulta nem cria nova confirmação. */
export function createRescheduleRequest(input: RescheduleRequestInput): RescheduleRequest {
  if (!input.id.trim()) throw new Error("Reschedule request id is required.");
  if (!Number.isInteger(input.patientUserId) || input.patientUserId < 1) {
    throw new Error("Reschedule request patient is required.");
  }
  if (!input.appointmentId.trim()) throw new Error("Reschedule request appointment is required.");
  if (!input.idempotencyKey.trim()) throw new Error("Reschedule request idempotency key is required.");
  if (Number.isNaN(input.requestedAt.getTime())) throw new Error("Reschedule request date is invalid.");
  if (!input.source.label.trim() || Number.isNaN(input.source.receivedAt.getTime())) {
    throw new Error("Reschedule request source is required.");
  }
  return Object.freeze({ ...input, status: "requested" });
}

export function canTransitionRescheduleRequest(
  from: RescheduleRequestStatus,
  to: RescheduleRequestStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}
