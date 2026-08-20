import type { MedicationIntakeStatus } from "./medication-intake";

export interface MedicationRoutineAlertInput {
  status: MedicationIntakeStatus;
  occurredAt: Date;
}

export interface MedicationRoutineAlert {
  title: string;
  evidence: string;
  safeAction: string;
  clinicalLimit: "Este alerta não substitui avaliação, prescrição ou orientação profissional.";
}

/**
 * Produz alertas administrativos de rotina, não alertas clínicos. A regra jamais calcula dose,
 * atraso aceitável, interação, gravidade, diagnóstico ou encaminhamento.
 */
export function createMedicationRoutineAlert(input: MedicationRoutineAlertInput): MedicationRoutineAlert | null {
  const at = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(input.occurredAt);
  if (input.status === "taken") return null;
  if (input.status === "needs_help") {
    return {
      title: "Ajuda solicitada na rotina",
      evidence: `Há um registro de que ajuda foi solicitada em ${at}.`,
      safeAction: "Confira a instrução registrada e, se necessário, contate a pessoa responsável ou a equipe assistencial definida no plano de cuidado.",
      clinicalLimit: "Este alerta não substitui avaliação, prescrição ou orientação profissional.",
    };
  }
  return {
    title: "Rotina precisa de conferência",
    evidence: `Há um registro de tomada não realizada em ${at}.`,
    safeAction: "Confira a instrução registrada na fonte. Não tome dose adicional nem altere o horário por orientação deste aplicativo.",
    clinicalLimit: "Este alerta não substitui avaliação, prescrição ou orientação profissional.",
  };
}
