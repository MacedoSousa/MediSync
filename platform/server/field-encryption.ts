import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION = "v1";

function toContextBuffer(context: string) {
  if (!context.trim()) throw new Error("Sensitive field context is required.");
  return Buffer.from(context, "utf8");
}

/** Carrega uma chave de 32 bytes sem jamais incluí-la em logs ou respostas HTTP. */
export function getFieldEncryptionKey(): Buffer {
  const encoded = process.env.MEDSYNC_FIELD_ENCRYPTION_KEY;
  if (!encoded) throw new Error("MEDSYNC_FIELD_ENCRYPTION_KEY is required.");

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("MEDSYNC_FIELD_ENCRYPTION_KEY must decode to 32 bytes.");
  return key;
}

/**
 * Cifra AES-256-GCM com AAD vinculada ao identificador do registro. O formato é
 * versionado para suportar rotação de chaves sem manter texto claro no banco.
 */
export function encryptSensitiveField(plainText: string, context: string): string {
  if (!plainText.trim()) throw new Error("Sensitive field value is required.");

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getFieldEncryptionKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  cipher.setAAD(toContextBuffer(context));
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSensitiveField(encryptedValue: string, context: string): string {
  const [version, ivValue, tagValue, ciphertextValue, extra] = encryptedValue.split(".");
  if (version !== VERSION || !ivValue || !tagValue || !ciphertextValue || extra) {
    throw new Error("Sensitive field ciphertext format is invalid.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getFieldEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
    { authTagLength: AUTH_TAG_LENGTH },
  );
  decipher.setAAD(toContextBuffer(context));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
}
