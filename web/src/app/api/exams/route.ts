import { prisma } from "@/lib/db";
import { requireSession, type SessionWithRole } from "@/lib/authz";
import { z } from "zod";

const CreateSchema = z.object({
  examTypeName: z.string().min(2),
  facilityId: z.string().nullable().optional(),
  desiredAt: z.string().datetime().optional(),
  mode: z.enum(["IN_PERSON", "ONLINE"]).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireSession(["PATIENT"]);
  if ("error" in auth) return auth.error;
  const s = auth.session as SessionWithRole;
  const me = await prisma.patient.findFirst({ where: { userId: s.user.id } });
  if (!me) return Response.json({ error: "Patient profile not found" }, { status: 400 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const type = await prisma.examType.findUnique({ where: { name: parsed.data.examTypeName } });
  if (!type) return Response.json({ error: "Unknown exam type" }, { status: 400 });

  // Validate policy
  const requestedMode = parsed.data.mode;
  if (type.policy === "IN_PERSON_ONLY" && requestedMode === "ONLINE") {
    return Response.json({ error: "Este exame só pode ser marcado presencialmente" }, { status: 400 });
  }

  const order = await prisma.examOrder.create({
    data: {
      patientId: me.id,
      doctorId: "", // será preenchido por fluxo médico; por enquanto vazio
      facilityId: parsed.data.facilityId ?? undefined,
      examTypeId: type.id,
      description: parsed.data.notes || type.name,
      status: "REQUESTED",
      scheduledAt: parsed.data.desiredAt ? new Date(parsed.data.desiredAt) : undefined,
      mode: requestedMode ?? (type.policy === "ANY" ? "IN_PERSON" : "IN_PERSON"),
    },
  });

  return Response.json({ examOrder: order });
}



