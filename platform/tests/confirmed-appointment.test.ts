import { describe, expect, it } from "vitest";

import { createConfirmedAppointment } from "../shared/confirmed-appointment";

const source = {
  id: "partner-demo-clinic",
  label: "Clínica parceira — demonstração",
  receivedAt: new Date("2026-08-20T10:00:00.000Z"),
  type: "demo" as const,
};

describe("confirmed appointment", () => {
  it("aceita somente consultas confirmadas com fonte, fuso e preparo explícitos", () => {
    const appointment = createConfirmedAppointment({
      id: "appointment-demo-01",
      patientUserId: 7,
      status: "confirmed",
      startsAt: new Date("2026-08-22T13:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa",
      professionalLabel: "Profissional registrado",
      preparationInstructions: "Leve um documento de identificação.",
      source,
    });
    expect(appointment.status).toBe("confirmed");
    expect(appointment.source.label).toContain("Clínica");
  });

  it("rejeita confirmação sem fonte rastreável", () => {
    expect(() => createConfirmedAppointment({
      id: "appointment-demo-02",
      patientUserId: 7,
      status: "confirmed",
      startsAt: new Date(),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa",
      professionalLabel: "Profissional registrado",
      preparationInstructions: "Leve um documento.",
      source: { ...source, label: "" },
    })).toThrow("Appointment source label is required.");
  });

  it("mantém cancelamento como estado diferente de confirmação", () => {
    const appointment = createConfirmedAppointment({
      id: "appointment-demo-03",
      patientUserId: 7,
      status: "cancelled",
      startsAt: new Date("2026-08-22T13:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa",
      professionalLabel: "Profissional registrado",
      preparationInstructions: "Leve um documento.",
      source,
      cancelledAt: new Date("2026-08-21T12:00:00.000Z"),
    });
    expect(appointment.status).toBe("cancelled");
    expect(appointment.cancelledAt).toBeInstanceOf(Date);
  });
});
