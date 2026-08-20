import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash } from "crypto";
import {
  auditEvents,
  careContacts,
  caregiverGrants,
  confirmedAppointments,
  consentRecords,
  InsertCareContact,
  InsertConfirmedAppointmentRecord,
  InsertConsentRecord,
  InsertCaregiverGrant,
  InsertLegalRepresentativeLink,
  InsertMedicationIntakeLog,
  InsertPartnerRescheduleDelivery,
  InsertRescheduleRequestRecord,
  InsertSyntheticHealthAssetRecord,
  InsertUser,
  legalRepresentativeLinks,
  medicationIntakeLogs,
  partnerRescheduleDeliveries,
  rescheduleRequests,
  syntheticHealthAssets,
  users,
} from "../drizzle/schema";
import {
  createAuditEvent,
  toAuditHashPayload,
  toPatientAuditEntry,
  type AuditEventInput,
} from "../shared/audit-event";
import { createAccessDeniedEvent, type AccessDeniedEventInput } from "../shared/access-denied-event";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createLegalRepresentativeLink(
  link: InsertLegalRepresentativeLink,
): Promise<void> {
  if (link.patientUserId === link.representativeUserId) {
    throw new Error("A patient cannot be their own legal representative.");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(legalRepresentativeLinks).values(link);
}

export async function listLegalRepresentativeLinksForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(legalRepresentativeLinks)
    .where(
      or(
        eq(legalRepresentativeLinks.patientUserId, userId),
        eq(legalRepresentativeLinks.representativeUserId, userId),
      ),
    )
    .orderBy(desc(legalRepresentativeLinks.createdAt));
}

export async function verifyLegalRepresentativeLink(input: {
  id: string;
  verificationReference: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(legalRepresentativeLinks)
    .set({
      status: "verified",
      verificationReference: input.verificationReference,
      verifiedAt: new Date(),
      expiresAt: input.expiresAt,
    })
    .where(
      and(
        eq(legalRepresentativeLinks.id, input.id),
        eq(legalRepresentativeLinks.status, "pending_verification"),
      ),
    );
}

export async function upsertCaregiverGrant(grant: InsertCaregiverGrant): Promise<void> {
  if (grant.patientUserId === grant.caregiverUserId) {
    throw new Error("A patient cannot be their own caregiver.");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(caregiverGrants).values(grant).onDuplicateKeyUpdate({
    set: {
      scopesJson: grant.scopesJson,
      startsAt: grant.startsAt,
      expiresAt: grant.expiresAt,
      revokedAt: null,
      updatedAt: new Date(),
    },
  });
}

export async function listCaregiverGrantsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(caregiverGrants)
    .where(
      or(
        eq(caregiverGrants.patientUserId, userId),
        eq(caregiverGrants.caregiverUserId, userId),
      ),
    )
    .orderBy(desc(caregiverGrants.createdAt));
}

export async function findActiveCaregiverMedicationGrant(input: {
  caregiverUserId: number;
  patientUserId: number;
  now: Date;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({ grant: caregiverGrants, consent: consentRecords })
    .from(caregiverGrants)
    .innerJoin(consentRecords, eq(caregiverGrants.consentRecordId, consentRecords.id))
    .where(
      and(
        eq(caregiverGrants.caregiverUserId, input.caregiverUserId),
        eq(caregiverGrants.patientUserId, input.patientUserId),
        eq(consentRecords.patientUserId, input.patientUserId),
        eq(consentRecords.granteeUserId, input.caregiverUserId),
        eq(consentRecords.purpose, "caregiver_support"),
        isNull(caregiverGrants.revokedAt),
        isNull(consentRecords.revokedAt),
        lte(caregiverGrants.startsAt, input.now),
        gt(caregiverGrants.expiresAt, input.now),
        lte(consentRecords.grantedAt, input.now),
        gt(consentRecords.expiresAt, input.now),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function revokeCaregiverGrant(id: string, patientUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(caregiverGrants)
    .set({ revokedAt: new Date() })
    .where(and(eq(caregiverGrants.id, id), eq(caregiverGrants.patientUserId, patientUserId)));
}

export async function upsertConsentRecord(record: InsertConsentRecord): Promise<void> {
  if (record.patientUserId === record.granteeUserId) {
    throw new Error("A patient cannot grant consent to themselves.");
  }
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(consentRecords).values(record).onDuplicateKeyUpdate({
    set: {
      scopesJson: record.scopesJson,
      grantedAt: record.grantedAt,
      expiresAt: record.expiresAt,
      revokedAt: null,
      updatedAt: new Date(),
    },
  });
}

export async function listConsentRecordsForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.patientUserId, patientUserId))
    .orderBy(desc(consentRecords.createdAt));
}

export async function revokeConsentRecord(id: string, patientUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(consentRecords)
    .set({ revokedAt: new Date() })
    .where(and(eq(consentRecords.id, id), eq(consentRecords.patientUserId, patientUserId)));
}

export async function findConsentRecordForPatient(id: string, patientUserId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const records = await db
    .select()
    .from(consentRecords)
    .where(and(eq(consentRecords.id, id), eq(consentRecords.patientUserId, patientUserId)))
    .limit(1);
  return records[0];
}

export async function createCareContact(contact: InsertCareContact): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(careContacts).values(contact);
}

export async function listCareContactsForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careContacts).where(eq(careContacts.patientUserId, patientUserId)).orderBy(desc(careContacts.createdAt));
}

export async function findCareContactForPatient(id: string, patientUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const records = await db
    .select()
    .from(careContacts)
    .where(and(eq(careContacts.id, id), eq(careContacts.patientUserId, patientUserId)))
    .limit(1);
  return records[0];
}

export async function removeCareContact(id: string, patientUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(careContacts).where(and(eq(careContacts.id, id), eq(careContacts.patientUserId, patientUserId)));
}

export async function findMedicationIntakeByIdempotency(patientUserId: number, idempotencyKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(medicationIntakeLogs)
    .where(and(eq(medicationIntakeLogs.patientUserId, patientUserId), eq(medicationIntakeLogs.idempotencyKey, idempotencyKey)))
    .limit(1);
  return rows[0];
}

export async function createMedicationIntakeLog(log: InsertMedicationIntakeLog) {
  const existing = await findMedicationIntakeByIdempotency(log.patientUserId, log.idempotencyKey);
  if (existing) return { log: existing, created: false } as const;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(medicationIntakeLogs).values(log);
  } catch {
    const retried = await findMedicationIntakeByIdempotency(log.patientUserId, log.idempotencyKey);
    if (retried) return { log: retried, created: false } as const;
    throw new Error("Medication intake could not be recorded.");
  }
  return { log, created: true } as const;
}

export async function findMedicationIntakeForPatient(id: string, patientUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(medicationIntakeLogs)
    .where(and(eq(medicationIntakeLogs.id, id), eq(medicationIntakeLogs.patientUserId, patientUserId)))
    .limit(1);
  return rows[0];
}

export async function listMedicationIntakesForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(medicationIntakeLogs)
    .where(eq(medicationIntakeLogs.patientUserId, patientUserId))
    .orderBy(desc(medicationIntakeLogs.recordedAt));
}

export async function upsertConfirmedAppointment(
  appointment: InsertConfirmedAppointmentRecord,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(confirmedAppointments).values(appointment).onDuplicateKeyUpdate({
    set: {
      status: appointment.status,
      startsAt: appointment.startsAt,
      timezone: appointment.timezone,
      location: appointment.location,
      professionalLabel: appointment.professionalLabel,
      preparationInstructions: appointment.preparationInstructions,
      sourceLabel: appointment.sourceLabel,
      sourceType: appointment.sourceType,
      sourceReceivedAt: appointment.sourceReceivedAt,
      cancelledAt: appointment.cancelledAt,
      updatedAt: new Date(),
    },
  });
}

export async function listConfirmedAppointmentsForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(confirmedAppointments)
    .where(eq(confirmedAppointments.patientUserId, patientUserId))
    .orderBy(desc(confirmedAppointments.startsAt));
}

export async function findConfirmedAppointmentForPatient(id: string, patientUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(confirmedAppointments)
    .where(and(eq(confirmedAppointments.id, id), eq(confirmedAppointments.patientUserId, patientUserId)))
    .limit(1);
  return rows[0];
}

export async function findRescheduleRequestByIdempotency(patientUserId: number, idempotencyKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(rescheduleRequests)
    .where(and(eq(rescheduleRequests.patientUserId, patientUserId), eq(rescheduleRequests.idempotencyKey, idempotencyKey)))
    .limit(1);
  return rows[0];
}

export async function createRescheduleRequest(request: InsertRescheduleRequestRecord) {
  const existing = await findRescheduleRequestByIdempotency(request.patientUserId, request.idempotencyKey);
  if (existing) return { request: existing, created: false } as const;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(rescheduleRequests).values(request);
  } catch {
    const retried = await findRescheduleRequestByIdempotency(request.patientUserId, request.idempotencyKey);
    if (retried) return { request: retried, created: false } as const;
    throw new Error("Reschedule request could not be recorded.");
  }
  return { request, created: true } as const;
}

export async function listRescheduleRequestsForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(rescheduleRequests)
    .where(eq(rescheduleRequests.patientUserId, patientUserId))
    .orderBy(desc(rescheduleRequests.requestedAt));
}

export async function findRescheduleRequestById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(rescheduleRequests).where(eq(rescheduleRequests.id, id)).limit(1);
  return rows[0];
}

export async function findPartnerRescheduleDelivery(sourceSystemId: string, deliveryId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(partnerRescheduleDeliveries)
    .where(and(
      eq(partnerRescheduleDeliveries.sourceSystemId, sourceSystemId),
      eq(partnerRescheduleDeliveries.deliveryId, deliveryId),
    ))
    .limit(1);
  return rows[0];
}

export async function recordPartnerRescheduleDelivery(delivery: InsertPartnerRescheduleDelivery) {
  const existing = await findPartnerRescheduleDelivery(delivery.sourceSystemId, delivery.deliveryId);
  if (existing) return { delivery: existing, created: false } as const;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(partnerRescheduleDeliveries).values(delivery);
  } catch {
    const retried = await findPartnerRescheduleDelivery(delivery.sourceSystemId, delivery.deliveryId);
    if (retried) return { delivery: retried, created: false } as const;
    throw new Error("Partner reschedule delivery could not be recorded.");
  }
  return { delivery, created: true } as const;
}

export async function updateRescheduleRequestStatus(input: {
  id: string;
  status: InsertRescheduleRequestRecord["status"];
  resolvedAt: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(rescheduleRequests)
    .set({ status: input.status, resolvedAt: input.resolvedAt, updatedAt: new Date() })
    .where(eq(rescheduleRequests.id, input.id));
}

export async function upsertSyntheticHealthAsset(asset: InsertSyntheticHealthAssetRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(syntheticHealthAssets).values(asset).onDuplicateKeyUpdate({
    set: {
      assetType: asset.assetType,
      titleCiphertext: asset.titleCiphertext,
      summaryCiphertext: asset.summaryCiphertext,
      sourceId: asset.sourceId,
      sourceLabel: asset.sourceLabel,
      sourceType: asset.sourceType,
      occurredAt: asset.occurredAt,
      storageObjectKey: asset.storageObjectKey,
      isSynthetic: true,
      updatedAt: new Date(),
    },
  });
}

export async function listSyntheticHealthAssetsForPatient(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(syntheticHealthAssets)
    .where(and(eq(syntheticHealthAssets.patientUserId, patientUserId), eq(syntheticHealthAssets.isSynthetic, true)))
    .orderBy(desc(syntheticHealthAssets.occurredAt));
}

export async function findSyntheticHealthAssetForPatient(id: string, patientUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(syntheticHealthAssets)
    .where(and(eq(syntheticHealthAssets.id, id), eq(syntheticHealthAssets.patientUserId, patientUserId), eq(syntheticHealthAssets.isSynthetic, true)))
    .limit(1);
  return rows[0];
}

export async function revokeActiveCaregiverConsent(patientUserId: number, caregiverUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(consentRecords)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(consentRecords.patientUserId, patientUserId),
        eq(consentRecords.granteeUserId, caregiverUserId),
        eq(consentRecords.purpose, "caregiver_support"),
        isNull(consentRecords.revokedAt),
      ),
    );
}

/** O helper apenas insere; alterações e exclusões são bloqueadas também no banco. */
export async function appendAuditEvent(input: AuditEventInput): Promise<void> {
  const event = createAuditEvent(input);
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const previous = await db
    .select({ eventHash: auditEvents.eventHash })
    .from(auditEvents)
    .orderBy(desc(auditEvents.sequence))
    .limit(1);
  const previousHash = previous[0]?.eventHash ?? "GENESIS";
  const eventHash = createHash("sha256").update(toAuditHashPayload(event, previousHash)).digest("hex");

  await db.insert(auditEvents).values({ ...event, previousHash, eventHash });
}

export async function recordDeniedAccess(input: AccessDeniedEventInput): Promise<void> {
  await appendAuditEvent(createAccessDeniedEvent(input));
}

export async function listPatientAuditEntries(patientUserId: number) {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.patientUserId, patientUserId))
    .orderBy(desc(auditEvents.sequence));

  return events.map((event) =>
    toPatientAuditEntry({
      id: event.id,
      actorUserId: event.actorUserId,
      patientUserId: event.patientUserId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      purpose: event.purpose,
      outcome: event.outcome,
      correlationId: event.correlationId,
      occurredAt: event.occurredAt,
    }),
  );
}
