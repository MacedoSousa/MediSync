export const EMERGENCY_PHONE_NUMBER = "192";

export interface EmergencyContingency {
  readonly phoneUri: `tel:${string}`;
  readonly message: string;
  readonly requiresAi: false;
  readonly requiresNetwork: false;
}

/**
 * Deliberately deterministic and local. This function must never invoke a model,
 * infer a clinical condition, or require a network request to expose emergency access.
 */
export function buildEmergencyContingency(_availability: { aiAvailable: boolean; networkAvailable: boolean }): EmergencyContingency {
  return {
    phoneUri: `tel:${EMERGENCY_PHONE_NUMBER}`,
    message: "Em uma emergência, procure atendimento imediato. Ligue para o SAMU 192 se precisar de atendimento de urgência.",
    requiresAi: false,
    requiresNetwork: false,
  };
}
