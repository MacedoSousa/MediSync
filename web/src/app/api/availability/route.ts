import { prisma } from "@/lib/db";
import { requireSession, type SessionWithRole } from "@/lib/authz";
import { z } from "zod";

const CreateSchema = z.object({
  doctorId: z.string(),
  facilityId: z.string().nullable().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().min(1).max(10).default(1),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId") || undefined;
  const facilityId = searchParams.get("facilityId") || undefined;
  const slots = await prisma.availabilitySlot.findMany({
    where: { doctorId, facilityId },
    orderBy: { startsAt: "asc" },
  });
  return Response.json({ slots });
}

export async function POST(req: Request) {
  const auth = await requireSession(["ADMIN", "DOCTOR"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const data = parsed.data;

  // If doctor, ensure owns the slot
  const s = auth.session as SessionWithRole;
  const role = s.user.role;
  if (role === "DOCTOR") {
    const me = await prisma.doctor.findFirst({ where: { userId: s.user.id } });
    if (!me || me.id !== data.doctorId) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const start = new Date(data.startsAt);
  const end = new Date(data.endsAt);
  if (!(start < end)) return Response.json({ error: "Invalid time range" }, { status: 400 });

  // Prevent overlap for same doctor
  const overlapping = await prisma.availabilitySlot.findFirst({
    where: {
      doctorId: data.doctorId,
      OR: [
        { startsAt: { lt: end }, endsAt: { gt: start } },
      ],
    },
  });
  if (overlapping) return Response.json({ error: "Overlapping slot" }, { status: 409 });

  const created = await prisma.availabilitySlot.create({
    data: {
      doctorId: data.doctorId,
      facilityId: data.facilityId ?? undefined,
      startsAt: start,
      endsAt: end,
      capacity: data.capacity,
    },
  });
  return Response.json({ slot: created });
}


