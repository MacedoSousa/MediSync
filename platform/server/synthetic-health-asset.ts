import type { InsertSyntheticHealthAssetRecord, SyntheticHealthAssetRecord } from "../drizzle/schema";
import type { SyntheticHealthAsset } from "../shared/synthetic-health-asset";
import { decryptSensitiveField, encryptSensitiveField } from "./field-encryption";

function context(assetId: string, field: "title" | "summary") {
  return `synthetic-health-asset:${assetId}:${field}`;
}

/** Mantém o rótulo demonstrativo e cifra descrições para evitar exposição desnecessária em repouso. */
export function createEncryptedSyntheticHealthAsset(
  asset: SyntheticHealthAsset,
): InsertSyntheticHealthAssetRecord & { sourceType: "demo"; isSynthetic: true } {
  return {
    id: asset.id,
    patientUserId: asset.patientUserId,
    assetType: asset.assetType,
    assetCode: asset.assetCode,
    titleCiphertext: encryptSensitiveField(asset.title, context(asset.id, "title")),
    summaryCiphertext: encryptSensitiveField(asset.summary, context(asset.id, "summary")),
    sourceId: asset.source.id,
    sourceLabel: asset.source.label,
    sourceType: "demo",
    occurredAt: asset.occurredAt,
    isSynthetic: true,
  };
}

export function decryptSyntheticHealthAsset(
  record: Omit<
    Pick<
      SyntheticHealthAssetRecord,
      "id" | "patientUserId" | "assetType" | "assetCode" | "titleCiphertext" | "summaryCiphertext" | "sourceId" | "sourceLabel" | "sourceType" | "occurredAt" | "storageObjectKey" | "isSynthetic"
    >,
    "storageObjectKey"
  > & { storageObjectKey?: string | null },
) {
  return {
    id: record.id,
    patientUserId: record.patientUserId,
    assetType: record.assetType,
    assetCode: record.assetCode,
    title: decryptSensitiveField(record.titleCiphertext, context(record.id, "title")),
    summary: decryptSensitiveField(record.summaryCiphertext, context(record.id, "summary")),
    source: { id: record.sourceId, label: record.sourceLabel, type: record.sourceType },
    occurredAt: record.occurredAt,
    isSynthetic: record.isSynthetic,
    hasPreview: Boolean(record.storageObjectKey),
    previewUrl: record.isSynthetic ? record.storageObjectKey ?? undefined : undefined,
  } as const;
}
