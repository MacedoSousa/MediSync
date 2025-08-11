import { prisma } from "@/lib/db";
import { requireSession, type SessionWithRole } from "@/lib/authz";
import { z } from "zod";

const PatchSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  capacity: z.number().int().min(1).max(10).optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireSession(["ADMIN", "DOCTOR"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() as string;
  const existing = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  const s = auth.session as SessionWithRole;
  const role = s.user.role;
  if (role === "DOCTOR") {
    const me = await prisma.doctor.findFirst({ where: { userId: s.user.id } });
    if (!me || me.id !== existing.doctorId) return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : existing.startsAt;
  const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : existing.endsAt;
  if (!(startsAt < endsAt)) return Response.json({ error: "Invalid time range" }, { status: 400 });

  // Check overlaps excluding self
  const overlapping = await prisma.availabilitySlot.findFirst({
    where: {
      doctorId: existing.doctorId,
      id: { not: existing.id },
      OR: [ { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } } ],
    },
  });
  if (overlapping) return Response.json({ error: "Overlapping slot" }, { status: 409 });

  const updated = await prisma.availabilitySlot.update({
    where: { id },
    data: { startsAt, endsAt, capacity: parsed.data.capacity ?? existing.capacity },
  });
  return Response.json({ slot: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireSession(["ADMIN", "DOCTOR"]);
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() as string;
  const existing = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  const s = auth.session as SessionWithRole;
  const role = s.user.role;
  if (role === "DOCTOR") {
    const me = await prisma.doctor.findFirst({ where: { userId: s.user.id } });
    if (!me || me.id !== existing.doctorId) return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.availabilitySlot.delete({ where: { id } });
  return Response.json({ ok: true });
}


