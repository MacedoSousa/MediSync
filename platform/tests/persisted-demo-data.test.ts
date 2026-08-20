import { describe, expect, it } from "vitest";
import { createPersistedDemoAppointments, createPersistedDemoAssets } from "../shared/testing/persisted-demo-data";

describe("dados demonstrativos persistidos", () => {
  it("fornece consultas com fonte estável, status visíveis e nenhuma orientação clínica", () => {
    const appointments = createPersistedDemoAppointments();

    expect(appointments).toHaveLength(4);
    expect(new Set(appointments.map((appointment) => appointment.sourceId)).size).toBe(4);
    expect(appointments.some((appointment) => appointment.status === "cancelled")).toBe(true);
    expect(appointments.every((appointment) => appointment.preparationInstructions.includes("demonstr"))).toBe(true);
  });

  it("fornece acervo variado, rotulado e idempotente por código", () => {
    const assets = createPersistedDemoAssets();

    expect(assets).toHaveLength(6);
    expect(new Set(assets.map((asset) => asset.assetCode)).size).toBe(6);
    expect(new Set(assets.map((asset) => asset.assetType))).toEqual(new Set(["exam_result", "radiology_image", "document"]));
    expect(assets.every((asset) => asset.summary.includes("não diagnóstico"))).toBe(true);
  });
});
