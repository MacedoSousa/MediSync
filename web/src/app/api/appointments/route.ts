import { prisma } from "@/lib/db";
import { encryptToBytes } from "@/lib/crypto";
import { appointmentConfirmation } from "@/lib/templates";
import { sqs, ensureQueueExists } from "@/lib/aws";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { createGoogleMeeting } from "@/lib/google";
import { createTeamsMeeting } from "@/lib/microsoft";
import { requireSession, type SessionWithRole } from "@/lib/authz";
import { z } from "zod";

const CreateSchema = z.object({
  doctorId: z.string(),
  facilityId: z.string().nullable().optional(),
  startsAt: z.string().datetime(),
  mode: z.enum(["IN_PERSON", "ONLINE"]).default("IN_PERSON"),
  notes: z.string().optional(),
});

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const s = auth.session as SessionWithRole;
  const userId = s.user.id;
  const role = s.user.role;
  if (role === "PATIENT") {
    const me = await prisma.patient.findFirst({ where: { userId } });
    if (!me) return Response.json({ appointments: [] });
    const list = await prisma.appointment.findMany({ where: { patientId: me.id }, orderBy: { startsAt: "asc" } });
    return Response.json({ appointments: list });
  }
  if (role === "DOCTOR") {
    const doc = await prisma.doctor.findFirst({ where: { userId } });
    if (!doc) return Response.json({ appointments: [] });
    const list = await prisma.appointment.findMany({ where: { doctorId: doc.id }, orderBy: { startsAt: "asc" } });
    return Response.json({ appointments: list });
  }
  // ADMIN view
  const list = await prisma.appointment.findMany({ orderBy: { startsAt: "asc" } });
  return Response.json({ appointments: list });
}

export async function POST(req: Request) {
  const auth = await requireSession(["PATIENT"]);
  if ("error" in auth) return auth.error;
  const s = auth.session as SessionWithRole;
  const me = await prisma.patient.findFirst({ where: { userId: s.user.id } });
  if (!me) return Response.json({ error: "Patient profile not found" }, { status: 400 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { doctorId, facilityId, startsAt, mode, notes } = parsed.data;
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + 30 * 60000);

  // Ensure within a slot and capacity not exceeded
  const slot = await prisma.availabilitySlot.findFirst({
    where: { doctorId, startsAt: { lte: start }, endsAt: { gte: end }, facilityId: facilityId ?? undefined },
  });
  if (!slot) return Response.json({ error: "No availability" }, { status: 409 });

  const overlapping = await prisma.appointment.count({
    where: {
      doctorId,
      startsAt: { lt: end },
      endsAt: { gt: start },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (overlapping >= (slot.capacity || 1)) return Response.json({ error: "Time fully booked" }, { status: 409 });

  // Attempt to generate meeting URL when online
  let meetingUrl: string | undefined = undefined;
  if (mode === "ONLINE") {
    try {
      // Here we would fetch the doctor's connected provider and tokens.
      // As a placeholder, attempt Google first if token is present in env, else Microsoft.
      if (process.env.GOOGLE_ACCESS_TOKEN) {
        meetingUrl = await createGoogleMeeting({
          accessToken: process.env.GOOGLE_ACCESS_TOKEN,
          summary: "Consulta MediSync",
          description: "Consulta online MediSync",
          startsAt: start,
          endsAt: end,
        }) ?? undefined;
      } else if (process.env.MS_GRAPH_ACCESS_TOKEN) {
        meetingUrl = await createTeamsMeeting({
          accessToken: process.env.MS_GRAPH_ACCESS_TOKEN,
          subject: "Consulta MediSync",
          startsAt: start,
          endsAt: end,
        }) ?? undefined;
      }
    } catch {}
  }

  const created = await prisma.appointment.create({
    data: {
      patientId: me.id,
      doctorId,
      facilityId: facilityId ?? undefined,
      startsAt: start,
      endsAt: end,
      mode,
      meetingUrl,
      notesEncrypted: typeof notes === "string" && notes.length > 0 ? encryptToBytes(notes) : undefined,
      status: "PENDING",
    },
  });
  // Enqueue confirmation email to patient
  const patient = await prisma.patient.findUnique({ where: { id: me.id }, include: { user: true } });
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: true } });
  if (patient?.user?.email) {
    const tmpl = appointmentConfirmation({
      patientName: patient.user.name,
      doctorName: doctor?.user?.name,
      startsAtISO: start.toISOString(),
      mode,
      meetingUrl,
    });
    const QueueUrl = process.env.NOTIFY_QUEUE_URL || "http://localhost:4566/000000000000/medisync-notify";
    await ensureQueueExists(QueueUrl).catch(() => {});
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify({ kind: "email", to: patient.user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text }) }));
  }
  return Response.json({ appointment: created });
}


