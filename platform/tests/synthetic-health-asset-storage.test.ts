import { describe, expect, it } from "vitest";

import { createEncryptedSyntheticHealthAsset, decryptSyntheticHealthAsset } from "../server/synthetic-health-asset";
import { createSyntheticHealthAsset } from "../shared/synthetic-health-asset";

describe("synthetic health asset storage", () => {
  it("cifra título e resumo antes da persistência e restaura somente na leitura autorizada", () => {
    const asset = createSyntheticHealthAsset({
      id: "c83d9b4f-e8de-474f-9ad6-34d6c3f7435a",
      patientUserId: 9,
      assetType: "exam_result",
      assetCode: "demo-lab-placeholder",
      occurredAt: new Date("2026-08-11T10:00:00.000Z"),
      source: { id: "medsync-demo", label: "Demonstração MedSync", type: "demo" },
      title: "Resultado laboratorial ilustrativo",
      summary: "Resultado sintético, não diagnóstico e exclusivo para teste de interface.",
    });
    const stored = createEncryptedSyntheticHealthAsset(asset);
    expect(stored.titleCiphertext).not.toContain(asset.title);
    expect(stored.summaryCiphertext).not.toContain(asset.summary);
    expect(decryptSyntheticHealthAsset(stored)).toMatchObject({
      id: asset.id,
      title: asset.title,
      summary: asset.summary,
      isSynthetic: true,
    });
  });
});
