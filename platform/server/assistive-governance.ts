import type { AssistiveAgentControl } from "../shared/assistive-governance";

const DEMONSTRATION_RULE_REVIEWED_AT = new Date("2026-08-20T00:00:00.000Z");

/**
 * Operational kill switch for the assistive model. Setting
 * MEDSYNC_ASSISTIVE_AGENT_ENABLED=false stops generation before any model call.
 * This control never changes the local emergency contingency.
 */
export function getAssistiveAgentControl(): AssistiveAgentControl {
  const enabled = process.env.MEDSYNC_ASSISTIVE_AGENT_ENABLED !== "false";
  return Object.freeze({
    enabled,
    activeRule: Object.freeze({
      id: "medsync-assistive-demonstration-safety",
      version: "1.0.0",
      ownerLabel: "Governança clínica e segurança MedSync",
      reviewStatus: "approved" as const,
      reviewedAt: DEMONSTRATION_RULE_REVIEWED_AT,
      enabled,
    }),
  });
}
