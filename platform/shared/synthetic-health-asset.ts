export const syntheticHealthAssetTypes = ["exam_result", "radiology_image", "document"] as const;

export type SyntheticHealthAssetType = (typeof syntheticHealthAssetTypes)[number];

export interface SyntheticHealthAssetSource {
  id: string;
  label: string;
  type: string;
}

export interface SyntheticHealthAssetInput {
  id: string;
  patientUserId: number;
  assetType: SyntheticHealthAssetType;
  assetCode: string;
  occurredAt: Date;
  source: SyntheticHealthAssetSource;
  title: string;
  summary: string;
}

export interface SyntheticHealthAsset extends SyntheticHealthAssetInput {
  isSynthetic: true;
}

/** Dados somente para teste de interface; nunca representam exame, laudo ou imagem de pessoa real. */
export function createSyntheticHealthAsset(input: SyntheticHealthAssetInput): SyntheticHealthAsset {
  if (!input.id.trim() || !input.assetCode.trim()) throw new Error("Synthetic asset identity is required.");
  if (!Number.isInteger(input.patientUserId) || input.patientUserId < 1) {
    throw new Error("Synthetic asset patient is required.");
  }
  if (!syntheticHealthAssetTypes.includes(input.assetType)) throw new Error("Synthetic asset type is invalid.");
  if (input.source.type !== "demo" || input.source.label !== "Demonstração MedSync") {
    throw new Error("Synthetic asset demonstration source is required.");
  }
  if (!input.title.trim() || !input.summary.toLowerCase().includes("não")) {
    throw new Error("Synthetic asset must include a non-diagnostic notice.");
  }
  if (Number.isNaN(input.occurredAt.getTime())) throw new Error("Synthetic asset date is invalid.");
  return Object.freeze({ ...input, isSynthetic: true });
}
