import {
  canTransitionRescheduleRequest,
  type RescheduleRequestStatus,
} from "./reschedule-request";

export type PartnerUpdateDecision =
  | { readonly decision: "apply" }
  | { readonly decision: "ignore" };

/**
 * Mantém a máquina de estados no domínio e impede que uma entrega repetida ou
 * uma transição fora do fluxo altere uma solicitação de reagendamento.
 */
export function decidePartnerRescheduleUpdate(
  currentStatus: RescheduleRequestStatus,
  incomingStatus: RescheduleRequestStatus,
): PartnerUpdateDecision {
  if (currentStatus === incomingStatus) return Object.freeze({ decision: "ignore" });
  if (!canTransitionRescheduleRequest(currentStatus, incomingStatus)) {
    throw new Error("Invalid partner reschedule status transition.");
  }
  return Object.freeze({ decision: "apply" });
}
