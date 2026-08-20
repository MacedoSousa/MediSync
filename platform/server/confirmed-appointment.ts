import type { ConfirmedAppointmentRecord, InsertConfirmedAppointmentRecord } from "../drizzle/schema";
import type { ConfirmedAppointment } from "../shared/confirmed-appointment";
import { decryptSensitiveField, encryptSensitiveField } from "./field-encryption";

function context(appointmentId: string, field: "location" | "professional" | "preparation") {
  return `confirmed-appointment:${appointmentId}:${field}`;
}

/** Armazena detalhes de atendimento cifrados; somente os metadados de agenda necessários ficam consultáveis. */
export function createEncryptedConfirmedAppointment(
  appointment: ConfirmedAppointment,
): InsertConfirmedAppointmentRecord {
  return {
    id: appointment.id,
    patientUserId: appointment.patientUserId,
    status: appointment.status,
    startsAt: appointment.startsAt,
    timezone: appointment.timezone,
    location: encryptSensitiveField(appointment.location, context(appointment.id, "location")),
    professionalLabel: encryptSensitiveField(appointment.professionalLabel, context(appointment.id, "professional")),
    preparationInstructions: encryptSensitiveField(
      appointment.preparationInstructions,
      context(appointment.id, "preparation"),
    ),
    sourceId: appointment.source.id,
    sourceLabel: appointment.source.label,
    sourceType: appointment.source.type,
    sourceReceivedAt: appointment.source.receivedAt,
    cancelledAt: appointment.cancelledAt,
  };
}

export function decryptConfirmedAppointment(record: ConfirmedAppointmentRecord) {
  return {
    id: record.id,
    patientUserId: record.patientUserId,
    status: record.status,
    startsAt: record.startsAt,
    timezone: record.timezone,
    location: decryptSensitiveField(record.location, context(record.id, "location")),
    professionalLabel: decryptSensitiveField(record.professionalLabel, context(record.id, "professional")),
    preparationInstructions: decryptSensitiveField(record.preparationInstructions, context(record.id, "preparation")),
    source: {
      id: record.sourceId,
      label: record.sourceLabel,
      type: record.sourceType,
      receivedAt: record.sourceReceivedAt,
    },
    cancelledAt: record.cancelledAt ?? undefined,
  } as const;
}
