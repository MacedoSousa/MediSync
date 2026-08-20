import { describe, expect, it } from "vitest";

import { createSyntheticHealthAsset } from "../shared/synthetic-health-asset";

describe("synthetic health asset contract", () => {
  it("marca resultados, documentos e imagens como demonstração não diagnóstica", () => {
    const asset = createSyntheticHealthAsset({
      id: "47fc421b-5947-4f08-b3e3-0a02e6e670ae",
      patientUserId: 7,
      assetType: "radiology_image",
      assetCode: "demo-radiology-placeholder",
      occurredAt: new Date("2026-08-10T09:00:00.000Z"),
      source: { id: "medsync-demo", label: "Demonstração MedSync", type: "demo" },
      title: "Imagem radiológica ilustrativa",
      summary: "Imagem sintética para demonstrar a interface; não utilizar para decisão clínica.",
    });
    expect(asset.isSynthetic).toBe(true);
    expect(asset.source.label).toBe("Demonstração MedSync");
    expect(asset.assetType).toBe("radiology_image");
  });

  it("rejeita origem não demonstrativa e conteúdo sem o aviso de segurança", () => {
    expect(() =>
      createSyntheticHealthAsset({
        id: "e7a9767f-0054-4e95-adb9-7f78c4ceb4cc",
        patientUserId: 7,
        assetType: "exam_result",
        assetCode: "demo-exam-result",
        occurredAt: new Date(),
        source: { id: "external", label: "Sistema externo", type: "partner" },
        title: "Resultado",
        summary: "Conteúdo fictício não diagnóstico.",
      }),
    ).toThrow("demonstration");
  });
});
