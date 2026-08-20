import { describe, expect, it } from "vitest";

import { createSafeRequestLog, resolveCorrelationId } from "../shared/request-observability";

describe("observabilidade HTTP", () => {
  it("aceita somente identificadores UUID e cria um novo valor quando a origem é inválida", () => {
    const generated = "11111111-1111-4111-8111-111111111111";
    expect(resolveCorrelationId("22222222-2222-4222-8222-222222222222", () => generated)).toBe("22222222-2222-4222-8222-222222222222");
    expect(resolveCorrelationId("paciente@example.com", () => generated)).toBe(generated);
  });

  it("produz um evento estruturado sem consulta, cabeçalho, corpo ou identificadores pessoais", () => {
    expect(createSafeRequestLog({ method: "POST", url: "/api/trpc/assistiveSummary.generateDemoMine?patient=42", statusCode: 200, durationMs: 12, correlationId: "11111111-1111-4111-8111-111111111111" })).toEqual({
      event: "http_request_completed",
      method: "POST",
      route: "/api/trpc",
      statusCode: 200,
      durationMs: 12,
      correlationId: "11111111-1111-4111-8111-111111111111",
    });
  });
});
