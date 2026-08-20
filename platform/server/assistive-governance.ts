import type { AssistiveAgentControl } from "../shared/assistive-governance";
import * as db from "./db";

const DEMONSTRATION_RULE_REVIEWED_AT = new Date("2026-08-20T00:00:00.000Z");

/**
 * Operational kill switch for the assistive model. Setting
 * MEDSYNC_ASSISTIVE_AGENT_ENABLED=false stops generation before any model call.
 * This control never changes the local emergency contingency.
 */
const DEFAULT_RULE_ID = "medsync-assistive-demonstration-safety";
const DEFAULT_RULE_VERSION = "1.0.0";
const DEFAULT_RULE_RECORD_ID = "medsync-governance-default-v1";
const DEFAULT_POLICY_FINGERPRINT = "fb85ce5e33a9167872072951fd489c090676894fc8852e755a100c8451302485";

export async function ensureDefaultAssistiveGovernanceRule() {
  return db.createGovernanceRuleIfAbsent({
    id: DEFAULT_RULE_RECORD_ID,
    ruleId: DEFAULT_RULE_ID,
    version: DEFAULT_RULE_VERSION,
    ownerLabel: "Governança clínica e segurança MedSync",
    policyFingerprint: DEFAULT_POLICY_FINGERPRINT,
    reviewStatus: "approved",
    reviewedAt: DEMONSTRATION_RULE_REVIEWED_AT,
    enabled: true,
  });
}

export async function getAssistiveAgentControl(): Promise<AssistiveAgentControl> {
  const database = await db.getDb();
  const persistedRule = database ? await db.findActiveGovernanceRule() : undefined;
  const enabled = process.env.MEDSYNC_ASSISTIVE_AGENT_ENABLED !== "false" && (database ? Boolean(persistedRule) : true);
  return Object.freeze({
    enabled,
    activeRule: Object.freeze({
      id: persistedRule?.ruleId ?? DEFAULT_RULE_ID,
      version: persistedRule?.version ?? DEFAULT_RULE_VERSION,
      ownerLabel: persistedRule?.ownerLabel ?? "Governança clínica e segurança MedSync",
      reviewStatus: persistedRule?.reviewStatus ?? "approved",
      reviewedAt: persistedRule?.reviewedAt ?? DEMONSTRATION_RULE_REVIEWED_AT,
      enabled,
    }),
  });
}
