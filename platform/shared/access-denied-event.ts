import { createAuditEvent, type AuditEvent, type AuditResourceType } from "./audit-event";

export interface AccessDeniedEventInput {
  id: string;
  actorUserId: number;
  patientUserId: number;
  resourceType: AuditResourceType;
  resourceId: string;
  correlationId: string;
  occurredAt: Date;
}

/**
 * Mantém o evento de bloqueio minimizado: a razão detalhada fica fora da auditoria
 * do paciente para não fornecer informações utilizáveis por um invasor.
 */
export function createAccessDeniedEvent(input: AccessDeniedEventInput): AuditEvent {
  return createAuditEvent({
    ...input,
    action: "access_denied",
    purpose: "access_control",
    outcome: "denied",
  });
}
