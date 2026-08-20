import { describe, expect, it } from "vitest";

import { createConfirmedAppointment } from "../shared/confirmed-appointment";
import { createEncryptedConfirmedAppointment } from "../server/confirmed-appointment";

describe("confirmed appointment storage", () => {
  it("cifra detalhes de consulta antes da persistência", () => {
    const appointment = createConfirmedAppointment({
      id: "appointment-storage-01",
      patientUserId: 9,
      status: "confirmed",
      startsAt: new Date("2026-08-22T13:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa",
      professionalLabel: "Profissional registrado",
      preparationInstructions: "Leve um documento.",
      source: {
        id: "source-01",
        label: "Fonte demonstrativa",
        type: "demo",
        receivedAt: new Date("2026-08-20T10:00:00.000Z"),
      },
    });
    const encrypted = createEncryptedConfirmedAppointment(appointment);
    expect(encrypted.location).not.toContain("Unidade demonstrativa");
    expect(encrypted.professionalLabel).toMatch(/^v1\./);
    expect(encrypted.preparationInstructions).toMatch(/^v1\./);
  });
});
