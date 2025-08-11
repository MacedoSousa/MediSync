import { PrismaClient } from "@prisma/client";
import { encryptToBytes, decryptFromBytes } from "@/lib/crypto";

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as GlobalWithPrisma;

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Prisma field-level encryption middleware for selected models
prisma.$use(async (params, next): Promise<unknown> => {
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  // Encrypt before write
  if (params.action === "create" || params.action === "update") {
    if (params.model === "Prescription" && params.args?.data) {
      const data = params.args.data as Record<string, unknown>;
      const content = data["content"];
      if (typeof content === "string" && content.length > 0) {
        (data as Record<string, unknown>)["encryptedContent"] = encryptToBytes(content);
        delete (data as Record<string, unknown>)["content"];
      }
    }
    if (params.model === "ExamOrder" && params.args?.data) {
      const data = params.args.data as Record<string, unknown>;
      const result = data["result"];
      if (typeof result === "string" && result.length > 0) {
        (data as Record<string, unknown>)["encryptedResult"] = encryptToBytes(result);
        delete (data as Record<string, unknown>)["result"];
      }
    }
    if (params.model === "Appointment" && params.args?.data) {
      const data = params.args.data as Record<string, unknown>;
      const notes = data["notes"];
      if (typeof notes === "string" && notes.length > 0) {
        (data as Record<string, unknown>)["notesEncrypted"] = encryptToBytes(notes);
        delete (data as Record<string, unknown>)["notes"];
      }
    }
  }

  const result = await next(params);

  // Decrypt after read
  if (
    params.action.startsWith("find") ||
    params.action === "create" ||
    params.action === "update" ||
    params.action === "upsert"
  ) {
    const decryptPrescription = (p: unknown) => {
      if (!isRecord(p)) return;
      const enc = p["encryptedContent"];
      const hasPlain = p["content"] !== undefined && p["content"] !== null;
      if (Buffer.isBuffer(enc) && !hasPlain) {
        try {
          (p as Record<string, unknown>)["content"] = decryptFromBytes(enc);
        } catch {}
      }
    };
    const decryptExamOrder = (e: unknown) => {
      if (!isRecord(e)) return;
      const enc = e["encryptedResult"];
      const hasPlain = e["result"] !== undefined && e["result"] !== null;
      if (Buffer.isBuffer(enc) && !hasPlain) {
        try {
          (e as Record<string, unknown>)["result"] = decryptFromBytes(enc);
        } catch {}
      }
    };
    const decryptAppointment = (a: unknown) => {
      if (!isRecord(a)) return;
      const enc = a["notesEncrypted"];
      const hasPlain = a["notes"] !== undefined && a["notes"] !== null;
      if (Buffer.isBuffer(enc) && !hasPlain) {
        try {
          (a as Record<string, unknown>)["notes"] = decryptFromBytes(enc);
        } catch {}
      }
    };

    const maybeDecrypt = (obj: unknown) => {
      if (!obj || typeof obj !== "object") return;
      if (params.model === "Prescription") decryptPrescription(obj);
      if (params.model === "ExamOrder") decryptExamOrder(obj);
      if (params.model === "Appointment") decryptAppointment(obj);
    };

    if (Array.isArray(result)) {
      for (const item of result) maybeDecrypt(item);
    } else {
      maybeDecrypt(result);
    }
  }

  return result;
});


