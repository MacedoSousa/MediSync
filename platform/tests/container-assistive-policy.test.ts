import { describe, expect, it } from "vitest";

import { createContainerAssistiveRequest } from "../docker/ai-assistive/policy.mjs";

describe("container assistive policy", () => {
  it("aceita somente contexto sintético autorizado e mantém limites clínicos no prompt", () => {
    const request = createContainerAssistiveRequest({
      records: [{ recordId: "demo-001", title: "Resultado ilustrativo", sourceName: "Ambiente de demonstração", synthetic: true }],
    });

    expect(request.messages[0].content).toMatch(/não diagnostique/i);
    expect(request.messages[1].content).toContain("demo-001");
    expect(request.responseSchema.required).toEqual(["items"]);
  });

  it("rejeita contexto não sintético e campos de orientação clínica", () => {
    expect(() => createContainerAssistiveRequest({ records: [{ recordId: "real-001", title: "Registro", sourceName: "Fonte", synthetic: false }] })).toThrow(/synthetic/i);
    expect(() => createContainerAssistiveRequest({ records: [{ recordId: "demo-001", title: "Dose 20 mg", sourceName: "Fonte", synthetic: true }] })).toThrow(/prohibited/i);
  });
});
