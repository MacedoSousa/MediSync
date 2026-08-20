export const ASSISTIVE_TRANSPARENCY = Object.freeze({
  schemaVersion: "1.0.0",
  dataUse: Object.freeze([
    "Registros autorizados e sua proveniência declarada.",
    "Categoria, título, data registrada e fonte identificada de cada registro.",
    "Somente dados de demonstração claramente rotulados enquanto o ambiente estiver em modo demonstrativo.",
  ]),
  prohibitedCapabilities: Object.freeze([
    "Diagnóstico, triagem, prescrição ou cálculo de dose.",
    "Prognóstico, recomendação de tratamento ou decisão clínica autônoma.",
    "Acionamento automático de familiares, pronto-socorro ou serviços de emergência.",
  ]),
  emergencyFallback: "Em situação de emergência, use o fluxo local com SAMU 192 e contatos autorizados; ele não depende da IA ou da conexão.",
  disableInstructions: "Você pode desativar esta função nesta tela. A desativação interrompe novas gerações e não remove seus registros de saúde.",
});

export function normalizeAssistivePreference(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("A preferência assistiva deve ser booleana.");
  return value;
}

export function canGenerateAssistiveSummary(input: { userEnabled: boolean; agentEnabled: boolean }): boolean {
  return input.userEnabled && input.agentEnabled;
}
