import { describe, expect, it } from "vitest";

import { createDiscreteMedicationReminder } from "../shared/medication-reminder-policy";

describe("medication reminder policy", () => {
  it("cria lembrete diário com conteúdo neutro, sem medicamento, dose ou diagnóstico", () => {
    const reminder = createDiscreteMedicationReminder("08:30");
    expect(reminder).toEqual({ hour: 8, minute: 30, title: "Rotina de saúde", body: "Você tem uma rotina para conferir no MedSync." });
    expect(reminder.body).not.toMatch(/dose|medicamento|receita/i);
  });

  it("rejeita horários fora do formato 24 horas", () => {
    expect(() => createDiscreteMedicationReminder("24:00")).toThrow("time");
    expect(() => createDiscreteMedicationReminder("8:30")).toThrow("time");
  });
});
