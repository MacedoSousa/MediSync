import { describe, expect, it } from "vitest";

import { canTransitionRescheduleRequest, createRescheduleRequest } from "../shared/reschedule-request";

const baseRequest = {
  id: "919a9e0c-3bd6-4b0f-98d8-649675396872",
  patientUserId: 42,
  appointmentId: "a8187823-e22c-4ad9-a9df-101e02a3720e",
  idempotencyKey: "151e1784-b485-4dd4-a1f8-4aacd6ffb18f",
  requestedAt: new Date("2026-08-20T12:00:00.000Z"),
  source: {
    label: "Clínica demonstrativa MedSync",
    receivedAt: new Date("2026-08-20T12:00:00.000Z"),
    type: "demo" as const,
  },
};

describe("reschedule request contract", () => {
  it("cria uma solicitação distinta da confirmação de consulta", () => {
    const request = createRescheduleRequest(baseRequest);
    expect(request.status).toBe("requested");
    expect(request.appointmentId).toBe(baseRequest.appointmentId);
    expect(request.source.label).toContain("demonstrativa");
  });

  it("não aceita solicitações sem identidade, consulta ou chave de idempotência", () => {
    expect(() => createRescheduleRequest({ ...baseRequest, patientUserId: 0 })).toThrow("patient");
    expect(() => createRescheduleRequest({ ...baseRequest, appointmentId: "" })).toThrow("appointment");
    expect(() => createRescheduleRequest({ ...baseRequest, idempotencyKey: "" })).toThrow("idempotency");
  });

  it("permite apenas transições de acompanhamento previstas", () => {
    expect(canTransitionRescheduleRequest("requested", "under_review")).toBe(true);
    expect(canTransitionRescheduleRequest("requested", "completed")).toBe(false);
    expect(canTransitionRescheduleRequest("options_received", "completed")).toBe(true);
    expect(canTransitionRescheduleRequest("completed", "requested")).toBe(false);
  });
});
