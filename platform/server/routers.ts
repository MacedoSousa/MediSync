import { TRPCError } from "@trpc/server";
import { createHash, randomUUID } from "crypto";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import * as db from "./db";
import { careContactCategories, createEncryptedCareContact, decryptCareContact } from "./care-contact";
import { createEncryptedConfirmedAppointment, decryptConfirmedAppointment } from "./confirmed-appointment";
import { createConfirmedAppointment } from "../shared/confirmed-appointment";
import { createMedicationIntakeLog, medicationIntakeStatuses } from "../shared/medication-intake";
import { evaluateDelegatedMedicationAccess } from "../shared/delegated-medication-access";
import { createSyntheticMedicationPlans, medicationPlanView } from "../shared/medication-plan";
import { createRescheduleRequest } from "../shared/reschedule-request";
import { validatePartnerRescheduleUpdate } from "../shared/partner-reschedule-adapter";
import { decidePartnerRescheduleUpdate } from "../shared/partner-reschedule-processing";
import { createSyntheticHealthAsset } from "../shared/synthetic-health-asset";
import { createSyntheticHealthScenario } from "../shared/testing/synthetic-health-fixtures";
import { createPersistedDemoAppointments, createPersistedDemoAssets } from "../shared/testing/persisted-demo-data";
import { createEncryptedSyntheticHealthAsset, decryptSyntheticHealthAsset } from "./synthetic-health-asset";
import { generateAssistiveSummary } from "./assistive-summary";
import { ensureDefaultAssistiveGovernanceRule, getAssistiveAgentControl } from "./assistive-governance";
import { decideGovernanceRuleReview, summarizeAssistiveGovernanceMetrics } from "../shared/assistive-governance-review";
import { ASSISTIVE_TRANSPARENCY, canGenerateAssistiveSummary, normalizeAssistivePreference } from "../shared/assistive-transparency";
import { deriveAssistiveOperationalStatus } from "../shared/assistive-operational-status";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

async function recordDeniedAccess(input: {
  actorUserId: number;
  patientUserId: number;
  resourceType: "legal_representative" | "caregiver_grant" | "consent" | "care_contact" | "medication_intake" | "medication_routine" | "appointment" | "reschedule_request" | "synthetic_health_asset";
  resourceId: string;
}) {
  await db.recordDeniedAccess({
    id: randomUUID(),
    ...input,
    correlationId: randomUUID(),
    occurredAt: new Date(),
  });
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  legalRepresentative: router({
    listMine: protectedProcedure.query(({ ctx }) =>
      db.listLegalRepresentativeLinksForUser(ctx.user.id),
    ),
    request: protectedProcedure
      .input(
        z.object({
          representativeOpenId: z.string().trim().min(1).max(64),
          relationship: z.enum(["parent_or_guardian", "court_appointed_guardian"]),
          expiresAt: z.coerce.date().refine((value) => value > new Date(), {
            message: "The legal representative expiry must be in the future.",
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const representative = await db.getUserByOpenId(input.representativeOpenId);
        if (!representative) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "legal_representative",
            resourceId: "account_lookup",
          });
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "The representative must have an active MedSync account.",
          });
        }
        if (representative.id === ctx.user.id) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "legal_representative",
            resourceId: "self_link",
          });
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A patient cannot be their own legal representative.",
          });
        }

        const linkId = randomUUID();
        await db.createLegalRepresentativeLink({
          id: linkId,
          patientUserId: ctx.user.id,
          representativeUserId: representative.id,
          relationship: input.relationship,
          status: "pending_verification",
          expiresAt: input.expiresAt,
        });
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "legal_representative_requested",
          resourceType: "legal_representative",
          resourceId: linkId,
          purpose: "access_control",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: new Date(),
        });
        return { status: "pending_verification" as const };
      }),
    verify: protectedProcedure
      .input(
        z.object({
          linkId: z.string().uuid(),
          verificationReference: z.string().trim().min(6).max(128),
          expiresAt: z.coerce.date().refine((value) => value > new Date(), {
            message: "The verified authority expiry must be in the future.",
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Administrative verification is required." });
        }

        await db.verifyLegalRepresentativeLink({
          id: input.linkId,
          verificationReference: input.verificationReference,
          expiresAt: input.expiresAt,
        });
        return { status: "verified" as const };
      }),
  }),
  caregiver: router({
    listMine: protectedProcedure.query(({ ctx }) => db.listCaregiverGrantsForUser(ctx.user.id)),
    grant: protectedProcedure
      .input(
        z.object({
          caregiverOpenId: z.string().trim().min(1).max(64),
          scopes: z.array(z.enum(["health_timeline", "medications", "appointments", "emergency_contacts"]))
            .min(1)
            .max(4),
          expiresAt: z.coerce.date().refine((value) => {
            const maximum = new Date();
            maximum.setDate(maximum.getDate() + 90);
            return value > new Date() && value <= maximum;
          }, { message: "Caregiver access must expire within 90 days." }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const caregiver = await db.getUserByOpenId(input.caregiverOpenId);
        if (!caregiver) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "caregiver_grant",
            resourceId: "account_lookup",
          });
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "The caregiver must have an active MedSync account.",
          });
        }
        if (caregiver.id === ctx.user.id) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "caregiver_grant",
            resourceId: "self_grant",
          });
          throw new TRPCError({ code: "BAD_REQUEST", message: "A patient cannot be their own caregiver." });
        }

        const consentId = randomUUID();
        const grantId = randomUUID();
        const correlationId = randomUUID();
        const grantedAt = new Date();
        await db.upsertConsentRecord({
          id: consentId,
          patientUserId: ctx.user.id,
          granteeUserId: caregiver.id,
          purpose: "caregiver_support",
          scopesJson: JSON.stringify(input.scopes),
          grantedAt,
          expiresAt: input.expiresAt,
        });
        await db.upsertCaregiverGrant({
          id: grantId,
          patientUserId: ctx.user.id,
          caregiverUserId: caregiver.id,
          consentRecordId: consentId,
          scopesJson: JSON.stringify(input.scopes),
          startsAt: grantedAt,
          expiresAt: input.expiresAt,
        });
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "consent_granted",
          resourceType: "consent",
          resourceId: consentId,
          purpose: "caregiver_support",
          outcome: "success",
          correlationId,
          occurredAt: new Date(),
        });
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "caregiver_granted",
          resourceType: "caregiver_grant",
          resourceId: grantId,
          purpose: "caregiver_support",
          outcome: "success",
          correlationId,
          occurredAt: new Date(),
        });
        return { status: "active" as const };
      }),
    revoke: protectedProcedure
      .input(z.object({ grantId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const grants = await db.listCaregiverGrantsForUser(ctx.user.id);
        const ownedGrant = grants.find(
          (grant) => grant.id === input.grantId && grant.patientUserId === ctx.user.id,
        );
        if (!ownedGrant) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "caregiver_grant",
            resourceId: input.grantId,
          });
          throw new TRPCError({ code: "NOT_FOUND", message: "Caregiver grant not found." });
        }
        await db.revokeCaregiverGrant(input.grantId, ctx.user.id);
        await db.revokeConsentRecord(ownedGrant.consentRecordId, ctx.user.id);
        const correlationId = randomUUID();
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "caregiver_revoked",
          resourceType: "caregiver_grant",
          resourceId: input.grantId,
          purpose: "privacy_management",
          outcome: "success",
          correlationId,
          occurredAt: new Date(),
        });
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "consent_revoked",
          resourceType: "consent",
          resourceId: ownedGrant.consentRecordId,
          purpose: "privacy_management",
          outcome: "success",
          correlationId,
          occurredAt: new Date(),
        });
        return { status: "revoked" as const };
      }),
  }),
  consent: router({
    listMine: protectedProcedure.query(({ ctx }) => db.listConsentRecordsForPatient(ctx.user.id)),
    revoke: protectedProcedure
      .input(z.object({ consentId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const consent = await db.findConsentRecordForPatient(input.consentId, ctx.user.id);
        if (!consent) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "consent",
            resourceId: input.consentId,
          });
          throw new TRPCError({ code: "NOT_FOUND", message: "Consent record not found." });
        }
        await db.revokeConsentRecord(input.consentId, ctx.user.id);
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "consent_revoked",
          resourceType: "consent",
          resourceId: input.consentId,
          purpose: "privacy_management",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: new Date(),
        });
        return { status: "revoked" as const };
      }),
  }),
  careContact: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const contacts = await db.listCareContactsForPatient(ctx.user.id);
      return contacts.map((contact) => decryptCareContact(contact));
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(160),
          phone: z.string().trim().min(8).max(32),
          category: z.enum(careContactCategories),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const contactId = randomUUID();
        const encryptedContact = createEncryptedCareContact({
          id: contactId,
          patientUserId: ctx.user.id,
          ...input,
        });
        try {
          await db.createCareContact(encryptedContact);
        } catch {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A care contact with this phone is already registered.",
          });
        }
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "care_contact_created",
          resourceType: "care_contact",
          resourceId: contactId,
          purpose: "care_coordination",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: new Date(),
        });
        return decryptCareContact(encryptedContact);
      }),
    remove: protectedProcedure
      .input(z.object({ contactId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const contact = await db.findCareContactForPatient(input.contactId, ctx.user.id);
        if (!contact) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "care_contact",
            resourceId: input.contactId,
          });
          throw new TRPCError({ code: "NOT_FOUND", message: "Care contact not found." });
        }
        await db.removeCareContact(input.contactId, ctx.user.id);
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "care_contact_removed",
          resourceType: "care_contact",
          resourceId: input.contactId,
          purpose: "privacy_management",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: new Date(),
        });
        return { status: "removed" as const };
      }),
  }),
  audit: router({
    listMine: protectedProcedure.query(({ ctx }) => db.listPatientAuditEntries(ctx.user.id)),
  }),
  appointment: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const appointments = await db.listConfirmedAppointmentsForPatient(ctx.user.id);
      return appointments.map(decryptConfirmedAppointment);
    }),
    ensureDemoMine: protectedProcedure.mutation(async ({ ctx }) => {
      const sourceReceivedAt = new Date("2026-08-01T12:00:00.000Z");
      for (const input of createPersistedDemoAppointments()) {
        const appointment = createConfirmedAppointment({
          id: randomUUID(),
          patientUserId: ctx.user.id,
          status: input.status,
          startsAt: input.startsAt,
          timezone: input.timezone,
          location: input.location,
          professionalLabel: input.professionalLabel,
          preparationInstructions: input.preparationInstructions,
          source: {
            id: input.sourceId,
            label: "Demonstração MedSync",
            type: "demo",
            receivedAt: sourceReceivedAt,
          },
          cancelledAt: input.cancelledAt,
        });
        await db.upsertConfirmedAppointment(createEncryptedConfirmedAppointment(appointment));
      }
      const appointments = await db.listConfirmedAppointmentsForPatient(ctx.user.id);
      return appointments.map(decryptConfirmedAppointment);
    }),
    getMine: protectedProcedure
      .input(z.object({ appointmentId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const appointment = await db.findConfirmedAppointmentForPatient(input.appointmentId, ctx.user.id);
        if (!appointment) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: ctx.user.id,
            resourceType: "appointment",
            resourceId: input.appointmentId,
          });
          throw new TRPCError({ code: "NOT_FOUND", message: "Confirmed appointment not found." });
        }
        const now = new Date();
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: ctx.user.id,
          action: "appointment_viewed",
          resourceType: "appointment",
          resourceId: appointment.id,
          purpose: "care_coordination",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: now,
        });
        return decryptConfirmedAppointment(appointment);
      }),
  }),
  reschedule: router({
    listMine: protectedProcedure.query(({ ctx }) => db.listRescheduleRequestsForPatient(ctx.user.id)),
    request: protectedProcedure
      .input(z.object({ appointmentId: z.string().uuid(), idempotencyKey: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const appointment = await db.findConfirmedAppointmentForPatient(input.appointmentId, ctx.user.id);
        if (!appointment) {
          await recordDeniedAccess({ actorUserId: ctx.user.id, patientUserId: ctx.user.id, resourceType: "appointment", resourceId: input.appointmentId });
          throw new TRPCError({ code: "NOT_FOUND", message: "Confirmed appointment not found." });
        }
        const requestedAt = new Date();
        const request = createRescheduleRequest({
          id: randomUUID(), patientUserId: ctx.user.id, appointmentId: appointment.id,
          idempotencyKey: input.idempotencyKey, requestedAt,
          source: { label: appointment.sourceLabel, type: appointment.sourceType, receivedAt: appointment.sourceReceivedAt },
        });
        const result = await db.createRescheduleRequest({
          id: request.id, patientUserId: request.patientUserId, appointmentId: request.appointmentId,
          status: request.status, idempotencyKey: request.idempotencyKey, requestedAt: request.requestedAt,
          sourceLabel: request.source.label, sourceType: request.source.type, sourceReceivedAt: request.source.receivedAt,
        });
        if (result.created) {
          await db.appendAuditEvent({
            id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
            action: "reschedule_requested", resourceType: "reschedule_request", resourceId: request.id,
            purpose: "care_coordination", outcome: "success", correlationId: randomUUID(), occurredAt: requestedAt,
          });
        }
        return result.request;
      }),
  }),
  partnerAgenda: router({
    applyDemoUpdate: protectedProcedure
      .input(z.object({
        schemaVersion: z.string(),
        sourceSystemId: z.literal("agenda-parceira-demonstracao"),
        deliveryId: z.string().uuid(),
        correlationId: z.string().uuid(),
        occurredAt: z.string().datetime(),
        update: z.object({
          externalRequestReference: z.string().uuid(),
          status: z.enum(["under_review", "options_received", "completed", "declined"]),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Em produção este limite será substituído pela identidade mútua do parceiro homologado.
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Partner adapter access is restricted." });
        }
        const accepted = validatePartnerRescheduleUpdate(input);
        const priorDelivery = await db.findPartnerRescheduleDelivery(accepted.sourceSystemId, accepted.deliveryId);
        if (priorDelivery) return { idempotent: true, requestId: priorDelivery.rescheduleRequestId, status: priorDelivery.resultingStatus };

        const request = await db.findRescheduleRequestById(accepted.correlationId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Reschedule request correlation was not found." });

        const decision = decidePartnerRescheduleUpdate(request.status, input.update.status);
        const occurredAt = new Date(input.occurredAt);
        if (decision.decision === "apply") {
          await db.updateRescheduleRequestStatus({
            id: request.id,
            status: input.update.status,
            resolvedAt: input.update.status === "completed" || input.update.status === "declined" ? occurredAt : null,
          });
        }
        const persisted = await db.recordPartnerRescheduleDelivery({
          id: randomUUID(), patientUserId: request.patientUserId, rescheduleRequestId: request.id,
          sourceSystemId: accepted.sourceSystemId, deliveryId: accepted.deliveryId,
          correlationId: accepted.correlationId, resultingStatus: input.update.status, receivedAt: occurredAt,
        });
        if (persisted.created && decision.decision === "apply") {
          await db.appendAuditEvent({
            id: randomUUID(), actorUserId: ctx.user.id, patientUserId: request.patientUserId,
            action: "reschedule_status_updated", resourceType: "reschedule_request", resourceId: request.id,
            purpose: "care_coordination", outcome: "success", correlationId: accepted.correlationId, occurredAt,
          });
        }
        return { idempotent: !persisted.created, requestId: request.id, status: input.update.status };
      }),
  }),
  assistiveSummary: router({
    operationalStatusMine: protectedProcedure.query(async ({ ctx }) =>
      deriveAssistiveOperationalStatus({
        userEnabled: await db.getUserAssistiveAgentEnabled(ctx.user.id),
        governanceEnabled: (await getAssistiveAgentControl()).enabled,
      }),
    ),
    generateDemoMine: protectedProcedure.mutation(async ({ ctx }) => {
      const now = new Date();
      const correlationId = randomUUID();
      const userEnabled = await db.getUserAssistiveAgentEnabled(ctx.user.id);
      const agentControl = await getAssistiveAgentControl();
      if (!canGenerateAssistiveSummary({ userEnabled, agentEnabled: agentControl.enabled })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: userEnabled
            ? "A organização assistiva está temporariamente bloqueada pela governança de segurança."
            : "A IA assistiva está desativada nas suas preferências.",
        });
      }
      const activeRule = await ensureDefaultAssistiveGovernanceRule();
      const scenario = createSyntheticHealthScenario();
      const result = await generateAssistiveSummary({
        patientId: String(ctx.user.id),
        authorizedSyntheticRecords: scenario.timeline,
        generatedAt: now,
      });
      let reviewId: string | undefined;
      if (activeRule) {
        const responseReview = await db.createAssistiveResponseReviewIfAbsent({
          id: randomUUID(),
          patientUserId: ctx.user.id,
          ruleRecordId: activeRule.id,
          correlationId,
          status: "approved",
          reason: "approved",
          responseFingerprint: createHash("sha256")
            .update(JSON.stringify(result.summary.items.map((item) => [item.recordId, item.text])))
            .digest("hex"),
        });
        if (responseReview.created) {
          await db.recordAssistiveMetric({ id: randomUUID(), metricType: "generated", ruleRecordId: activeRule.id, correlationId, occurredAt: now });
        }
        reviewId = responseReview.review.id;
      }
      await db.appendAuditEvent({
        id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
        action: "assistive_summary_generated", resourceType: "assistive_summary", resourceId: randomUUID(),
        purpose: "clinical_record_access", outcome: "success", correlationId, occurredAt: now,
      });
      return { ...result, syntheticNotice: scenario.notice, reviewId };
    }),
  }),
  assistiveTransparency: router({
    getMine: protectedProcedure.query(async ({ ctx }) => ({
      enabled: await db.getUserAssistiveAgentEnabled(ctx.user.id),
      transparency: ASSISTIVE_TRANSPARENCY,
    })),
    setEnabled: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const enabled = normalizeAssistivePreference(input.enabled);
        const occurredAt = new Date();
        await db.updateUserAssistiveAgentEnabled(ctx.user.id, enabled);
        await db.appendAuditEvent({
          id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
          action: "assistive_preference_updated", resourceType: "assistive_preference", resourceId: String(ctx.user.id),
          purpose: "privacy_management", outcome: "success", correlationId: randomUUID(), occurredAt,
        });
        return { enabled };
      }),
  }),
  assistiveGovernance: router({
    listRules: adminProcedure.query(async () => {
      await ensureDefaultAssistiveGovernanceRule();
      return db.listGovernanceRules();
    }),
    listResponseReviewQueue: adminProcedure.query(async () => {
      const reviews = await db.listPendingAssistiveResponseReviews();
      return reviews.map(({ patientUserId: _patientUserId, responseFingerprint: _responseFingerprint, ...review }) => review);
    }),
    metrics: adminProcedure.query(async () => summarizeAssistiveGovernanceMetrics(await db.listAssistiveMetricEvents())),
    decideRule: adminProcedure
      .input(z.object({ ruleRecordId: z.string().trim().min(1).max(64), decision: z.enum(["approve", "reject", "disable"]) }))
      .mutation(async ({ ctx, input }) => {
        const rule = await db.findGovernanceRuleById(input.ruleRecordId);
        if (!rule) throw new TRPCError({ code: "NOT_FOUND", message: "Governance rule not found." });
        const decision = decideGovernanceRuleReview({ rule, decision: input.decision });
        const occurredAt = new Date();
        await db.updateGovernanceRuleDecision({ id: rule.id, ...decision, reviewedAt: occurredAt });
        await db.appendAuditEvent({
          id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
          action: "assistive_governance_rule_reviewed", resourceType: "assistive_governance_rule", resourceId: rule.id,
          purpose: "ai_governance", outcome: "success", correlationId: randomUUID(), occurredAt,
        });
        return { id: rule.id, ...decision };
      }),
    decideResponseReview: adminProcedure
      .input(z.object({ reviewId: z.string().trim().min(1).max(64), decision: z.enum(["approve", "block"]) }))
      .mutation(async ({ ctx, input }) => {
        const review = await db.findAssistiveResponseReviewById(input.reviewId);
        if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Assistive response review not found." });
        const occurredAt = new Date();
        const status = input.decision === "approve" ? "approved" : "blocked" as const;
        const correlationId = randomUUID();
        await db.updateAssistiveResponseReview({ id: review.id, status, reviewerUserId: ctx.user.id, reviewedAt: occurredAt });
        if (status === "blocked") {
          await db.recordAssistiveMetric({ id: randomUUID(), metricType: "blocked", ruleRecordId: review.ruleRecordId, correlationId, occurredAt });
        }
        await db.appendAuditEvent({
          id: randomUUID(), actorUserId: ctx.user.id, patientUserId: review.patientUserId,
          action: "assistive_response_reviewed", resourceType: "assistive_response_review", resourceId: review.id,
          purpose: "ai_governance", outcome: "success", correlationId, occurredAt,
        });
        return { id: review.id, status };
      }),
    submitFeedbackMine: protectedProcedure
      .input(z.object({ reviewId: z.string().trim().min(1).max(64), feedback: z.enum(["helpful", "not_helpful", "safety_concern"]) }))
      .mutation(async ({ ctx, input }) => {
        const review = await db.findAssistiveResponseReviewForPatient(input.reviewId, ctx.user.id);
        if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Assistive response review not found." });
        const status = input.feedback === "safety_concern" ? "pending" : review.status;
        const occurredAt = new Date();
        const correlationId = randomUUID();
        await db.recordAssistiveFeedback({ id: review.id, feedback: input.feedback, status });
        await db.recordAssistiveMetric({
          id: randomUUID(),
          metricType: `feedback_${input.feedback}`,
          ruleRecordId: review.ruleRecordId,
          correlationId,
          occurredAt,
        });
        await db.appendAuditEvent({
          id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
          action: "assistive_feedback_recorded", resourceType: "assistive_response_review", resourceId: review.id,
          purpose: "ai_governance", outcome: "success", correlationId, occurredAt,
        });
        return { id: review.id, status };
      }),
  }),
  syntheticAsset: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const assets = await db.listSyntheticHealthAssetsForPatient(ctx.user.id);
      return assets.map(decryptSyntheticHealthAsset);
    }),
    ensureDemoMine: protectedProcedure.mutation(async ({ ctx }) => {
      const source = { id: "medsync-demo", label: "Demonstração MedSync" as const, type: "demo" as const };
      for (const assetInput of createPersistedDemoAssets()) {
        const asset = createSyntheticHealthAsset({
          id: randomUUID(), patientUserId: ctx.user.id, ...assetInput, source,
        });
        await db.upsertSyntheticHealthAsset({
          ...createEncryptedSyntheticHealthAsset(asset),
          storageObjectKey: assetInput.storageObjectKey,
        });
      }
      const persisted = await db.listSyntheticHealthAssetsForPatient(ctx.user.id);
      return persisted.map(decryptSyntheticHealthAsset);
    }),
    getMine: protectedProcedure
      .input(z.object({ assetId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const asset = await db.findSyntheticHealthAssetForPatient(input.assetId, ctx.user.id);
        if (!asset) {
          await recordDeniedAccess({ actorUserId: ctx.user.id, patientUserId: ctx.user.id, resourceType: "synthetic_health_asset", resourceId: input.assetId });
          throw new TRPCError({ code: "NOT_FOUND", message: "Synthetic health asset not found." });
        }
        await db.appendAuditEvent({
          id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
          action: "synthetic_asset_viewed", resourceType: "synthetic_health_asset", resourceId: asset.id,
          purpose: "clinical_record_access", outcome: "success", correlationId: randomUUID(), occurredAt: new Date(),
        });
        return decryptSyntheticHealthAsset(asset);
      }),
  }),
  medication: router({
    listIntakes: protectedProcedure.query(({ ctx }) => db.listMedicationIntakesForPatient(ctx.user.id)),
    delegatedRoutine: protectedProcedure
      .input(z.object({ patientUserId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const now = new Date();
        const row = await db.findActiveCaregiverMedicationGrant({
          caregiverUserId: ctx.user.id,
          patientUserId: input.patientUserId,
          now,
        });
        const scopes = parseCaregiverScopes(row?.grant.scopesJson);
        const decision = evaluateDelegatedMedicationAccess({
          actorId: ctx.user.id,
          caregiverId: ctx.user.id,
          patientId: input.patientUserId,
          scopes,
          startsAt: row?.grant.startsAt ?? now,
          expiresAt: row?.grant.expiresAt ?? now,
          revokedAt: row?.grant.revokedAt,
          now,
        });
        if (!decision.allowed) {
          await recordDeniedAccess({
            actorUserId: ctx.user.id,
            patientUserId: input.patientUserId,
            resourceType: "medication_routine",
            resourceId: `routine-${input.patientUserId}`,
          });
          throw new TRPCError({ code: "FORBIDDEN", message: "The delegated medication routine is not available." });
        }
        await db.appendAuditEvent({
          id: randomUUID(),
          actorUserId: ctx.user.id,
          patientUserId: input.patientUserId,
          action: "medication_routine_viewed",
          resourceType: "medication_routine",
          resourceId: `routine-${input.patientUserId}`,
          purpose: "caregiver_support",
          outcome: "success",
          correlationId: randomUUID(),
          occurredAt: now,
        });
        return { plans: createSyntheticMedicationPlans().map(medicationPlanView) };
      }),
    logIntake: protectedProcedure
      .input(z.object({
        medicationPlanReference: z.string().trim().min(1).max(128),
        status: z.enum(medicationIntakeStatuses),
        occurredAt: z.coerce.date().refine((value) => value <= new Date(Date.now() + 5 * 60 * 1000), { message: "The intake time cannot be in the future." }),
        idempotencyKey: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const recordedAt = new Date();
        const log = createMedicationIntakeLog({
          id: randomUUID(), patientUserId: ctx.user.id, actorUserId: ctx.user.id,
          medicationPlanReference: input.medicationPlanReference, status: input.status,
          occurredAt: input.occurredAt, recordedAt, idempotencyKey: input.idempotencyKey,
        });
        const result = await db.createMedicationIntakeLog(log);
        if (result.created) {
          await db.appendAuditEvent({
            id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
            action: "medication_intake_logged", resourceType: "medication_intake", resourceId: log.id,
            purpose: "care_coordination", outcome: "success", correlationId: randomUUID(), occurredAt: recordedAt,
          });
        }
        return result.log;
      }),
    correctIntake: protectedProcedure
      .input(z.object({
        originalLogId: z.string().uuid(), status: z.enum(medicationIntakeStatuses),
        occurredAt: z.coerce.date(), idempotencyKey: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const original = await db.findMedicationIntakeForPatient(input.originalLogId, ctx.user.id);
        if (!original) {
          await recordDeniedAccess({ actorUserId: ctx.user.id, patientUserId: ctx.user.id, resourceType: "medication_intake", resourceId: input.originalLogId });
          throw new TRPCError({ code: "NOT_FOUND", message: "Medication intake record not found." });
        }
        const recordedAt = new Date();
        const correction = createMedicationIntakeLog({
          id: randomUUID(), patientUserId: ctx.user.id, actorUserId: ctx.user.id,
          medicationPlanReference: original.medicationPlanReference, status: input.status,
          occurredAt: input.occurredAt, recordedAt, idempotencyKey: input.idempotencyKey, correctionOfId: original.id,
        });
        const result = await db.createMedicationIntakeLog(correction);
        if (result.created) {
          await db.appendAuditEvent({
            id: randomUUID(), actorUserId: ctx.user.id, patientUserId: ctx.user.id,
            action: "medication_intake_logged", resourceType: "medication_intake", resourceId: correction.id,
            purpose: "care_coordination", outcome: "success", correlationId: randomUUID(), occurredAt: recordedAt,
          });
        }
        return result.log;
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

function parseCaregiverScopes(serialized?: string) {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    const result = z.array(z.enum(["health_timeline", "medications", "appointments", "emergency_contacts"])).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export type AppRouter = typeof appRouter;
