export interface DiscreteMedicationReminder {
  hour: number;
  minute: number;
  title: "Rotina de saúde";
  body: "Você tem uma rotina para conferir no MedSync.";
}

/**
 * O conteúdo enviado à tela bloqueada é deliberadamente neutro. Nome de medicamento,
 * dose, diagnóstico, profissional e instrução permanecem somente dentro do app autenticado.
 */
export function createDiscreteMedicationReminder(time: string): DiscreteMedicationReminder {
  const match = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)$/.exec(time.trim());
  if (!match?.groups) throw new Error("Reminder time must use HH:MM in 24-hour format.");
  return {
    hour: Number(match.groups.hour),
    minute: Number(match.groups.minute),
    title: "Rotina de saúde",
    body: "Você tem uma rotina para conferir no MedSync.",
  };
}
