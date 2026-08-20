export const appointmentStatuses = ["confirmed", "cancelled"] as const;
export const appointmentSourceTypes = ["partner_api", "manual_verified", "demo"] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];
export type AppointmentSourceType = (typeof appointmentSourceTypes)[number];

export interface AppointmentSource {
  id: string;
  label: string;
  receivedAt: Date;
  type: AppointmentSourceType;
}

export interface ConfirmedAppointmentInput {
  id: string;
  patientUserId: number;
  status: AppointmentStatus;
  startsAt: Date;
  timezone: string;
  location: string;
  professionalLabel: string;
  preparationInstructions: string;
  source: AppointmentSource;
  cancelledAt?: Date;
}

export type ConfirmedAppointment = Readonly<ConfirmedAppointmentInput>;

/** A agenda aceita apenas confirmação recebida de fonte identificada; pedido de agenda é outro domínio. */
export function createConfirmedAppointment(input: ConfirmedAppointmentInput): ConfirmedAppointment {
  if (!input.id.trim() || input.patientUserId <= 0) throw new Error("Appointment identity is required.");
  if (!appointmentStatuses.includes(input.status)) throw new Error("Appointment status is invalid.");
  if (!input.source.id.trim()) throw new Error("Appointment source identifier is required.");
  if (!input.source.label.trim()) throw new Error("Appointment source label is required.");
  if (!appointmentSourceTypes.includes(input.source.type)) throw new Error("Appointment source type is invalid.");
  if (!input.timezone.trim()) throw new Error("Appointment timezone is required.");
  if (!input.location.trim() || !input.professionalLabel.trim() || !input.preparationInstructions.trim()) {
    throw new Error("Appointment location, professional and preparation are required.");
  }
  if (Number.isNaN(input.startsAt.getTime()) || Number.isNaN(input.source.receivedAt.getTime())) {
    throw new Error("Appointment timestamps must be valid.");
  }
  if (input.status === "cancelled" && !input.cancelledAt) throw new Error("Cancelled appointment timestamp is required.");
  if (input.status === "confirmed" && input.cancelledAt) throw new Error("Confirmed appointment cannot have cancellation timestamp.");
  return Object.freeze({
    ...input,
    location: input.location.trim(),
    professionalLabel: input.professionalLabel.trim(),
    preparationInstructions: input.preparationInstructions.trim(),
    timezone: input.timezone.trim(),
    source: Object.freeze({ ...input.source, id: input.source.id.trim(), label: input.source.label.trim() }),
  });
}
