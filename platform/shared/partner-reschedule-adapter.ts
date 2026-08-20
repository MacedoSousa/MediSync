import { rescheduleRequestStatuses, type RescheduleRequestStatus } from "./reschedule-request";

export const PARTNER_RESCHEDULE_UPDATE_SCHEMA_VERSION = "medsync.partner-reschedule-update.v1" as const;

const partnerManagedStatuses = rescheduleRequestStatuses.filter(
  (status): status is Exclude<RescheduleRequestStatus, "requested" | "withdrawn"> => status !== "requested" && status !== "withdrawn",
);

export interface PartnerRescheduleUpdateEnvelope {
  schemaVersion: string;
  sourceSystemId: string;
  deliveryId: string;
  correlationId: string;
  occurredAt: string;
  update: {
    externalRequestReference: string;
    status: Exclude<RescheduleRequestStatus, "requested" | "withdrawn">;
  };
}

export interface AcceptedPartnerRescheduleUpdate {
  readonly accepted: true;
  readonly sourceSystemId: string;
  readonly deliveryId: string;
  readonly correlationId: string;
}

/**
 * Contrato de fronteira para parceiros homologados. A autenticação da origem é
 * responsabilidade do transporte (mTLS/HMAC/OAuth do integrador) e deve ser
 * validada antes desta etapa. O contrato não recebe conteúdo clínico livre.
 */
export function validatePartnerRescheduleUpdate(
  envelope: PartnerRescheduleUpdateEnvelope,
): AcceptedPartnerRescheduleUpdate {
  if (envelope.schemaVersion !== PARTNER_RESCHEDULE_UPDATE_SCHEMA_VERSION) {
    throw new Error("Unsupported partner reschedule update schema version.");
  }
  if (!envelope.sourceSystemId.trim()) throw new Error("Partner source system is required.");
  if (!envelope.deliveryId.trim()) throw new Error("Partner delivery id is required.");
  if (!envelope.correlationId.trim()) throw new Error("Partner correlation id is required.");
  if (Number.isNaN(Date.parse(envelope.occurredAt))) throw new Error("Partner update timestamp must be valid ISO.");
  if (!envelope.update.externalRequestReference.trim()) {
    throw new Error("Partner external request reference is required.");
  }
  if (envelope.update.externalRequestReference !== envelope.correlationId) {
    throw new Error("Partner external request reference must match correlation id.");
  }
  if (!partnerManagedStatuses.includes(envelope.update.status)) {
    throw new Error("Partner update status is invalid.");
  }
  return Object.freeze({
    accepted: true,
    sourceSystemId: envelope.sourceSystemId.trim(),
    deliveryId: envelope.deliveryId.trim(),
    correlationId: envelope.correlationId.trim(),
  });
}
