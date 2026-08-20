import { createHmac } from "crypto";

import { decryptSensitiveField, encryptSensitiveField, getFieldEncryptionKey } from "./field-encryption";

export const careContactCategories = ["family", "healthcare", "emergency_service", "other"] as const;
export type CareContactCategory = (typeof careContactCategories)[number];

export interface CreateCareContactInput {
  id: string;
  patientUserId: number;
  name: string;
  phone: string;
  category: CareContactCategory;
}

export interface EncryptedCareContact {
  id: string;
  patientUserId: number;
  nameCiphertext: string;
  phoneCiphertext: string;
  contactFingerprint: string;
  category: CareContactCategory;
}

export function normalizeCarePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) throw new Error("Care contact phone must have between 8 and 15 digits.");
  return `+${digits}`;
}

function contactContext(contactId: string, field: "name" | "phone") {
  return `care-contact:${contactId}:${field}`;
}

function fingerprintPhone(phone: string): string {
  return createHmac("sha256", getFieldEncryptionKey()).update(phone, "utf8").digest("hex");
}

export function createEncryptedCareContact(input: CreateCareContactInput): EncryptedCareContact {
  const name = input.name.trim();
  if (!name) throw new Error("Care contact name is required.");
  const phone = normalizeCarePhone(input.phone);

  return {
    id: input.id,
    patientUserId: input.patientUserId,
    nameCiphertext: encryptSensitiveField(name, contactContext(input.id, "name")),
    phoneCiphertext: encryptSensitiveField(phone, contactContext(input.id, "phone")),
    contactFingerprint: fingerprintPhone(phone),
    category: input.category,
  };
}

export function decryptCareContact(input: EncryptedCareContact) {
  return {
    id: input.id,
    category: input.category,
    name: decryptSensitiveField(input.nameCiphertext, contactContext(input.id, "name")),
    phone: decryptSensitiveField(input.phoneCiphertext, contactContext(input.id, "phone")),
  };
}
