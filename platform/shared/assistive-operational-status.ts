export type AssistiveOperationalState =
  | "available_with_fallback"
  | "disabled_by_preference"
  | "disabled_by_governance";

export type AssistiveOperationalStatus = Readonly<{
  state: AssistiveOperationalState;
  canGenerate: boolean;
  label: string;
  description: string;
  emergencyContingencyIndependent: true;
  startsClinicalAction: false;
  usesExternalContact: false;
}>;

/**
 * Descreve somente a capacidade de organização assistiva. A contingência de
 * emergência não depende deste estado e nunca é disparada por este contrato.
 */
export function deriveAssistiveOperationalStatus(input: {
  userEnabled: boolean;
  governanceEnabled: boolean;
}): AssistiveOperationalStatus {
  if (!input.userEnabled) {
    return Object.freeze({
      state: "disabled_by_preference",
      canGenerate: false,
      label: "Organização assistiva desativada por você",
      description: "Sua preferência bloqueia novos resumos. O acesso de emergência continua disponível de forma independente.",
      emergencyContingencyIndependent: true,
      startsClinicalAction: false,
      usesExternalContact: false,
    });
  }

  if (!input.governanceEnabled) {
    return Object.freeze({
      state: "disabled_by_governance",
      canGenerate: false,
      label: "Organização assistiva temporariamente indisponível",
      description: "A governança de segurança bloqueou novos resumos. O acesso de emergência continua disponível de forma independente.",
      emergencyContingencyIndependent: true,
      startsClinicalAction: false,
      usesExternalContact: false,
    });
  }

  return Object.freeze({
    state: "available_with_fallback",
    canGenerate: true,
    label: "Organização assistiva disponível com fallback seguro",
    description: "Se o modelo não responder, o protótipo usa um resumo determinístico dos registros autorizados. Não há triagem, diagnóstico ou contato externo.",
    emergencyContingencyIndependent: true,
    startsClinicalAction: false,
    usesExternalContact: false,
  });
}
