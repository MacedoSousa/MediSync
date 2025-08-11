import { prisma } from "@/lib/db";

function roundToThirty(date: Date) {
  const d = new Date(date);
  const minutes = d.getMinutes();
  d.setMinutes(minutes - (minutes % 30), 0, 0);
  return d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId");
  const facilityId = searchParams.get("facilityId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  if (!dateStr) return Response.json({ error: "Missing date" }, { status: 400 });
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      startsAt: { lte: dayEnd },
      endsAt: { gte: dayStart },
      doctorId: doctorId || undefined,
      facilityId: facilityId || undefined,
    },
  });

  const suggestions: { start: string; doctorId: string; facilityId?: string | null }[] = [];
  for (const slot of slots) {
    // build 30-min windows inside slot
    const start = roundToThirty(slot.startsAt);
    for (let t = start.getTime(); t + 30 * 60000 <= slot.endsAt.getTime(); t += 30 * 60000) {
      const s = new Date(t);
      const e = new Date(t + 30 * 60000);
      const overlapping = await prisma.appointment.count({
        where: {
          doctorId: slot.doctorId,
          startsAt: { lt: e },
          endsAt: { gt: s },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
      if (overlapping < slot.capacity) {
        suggestions.push({ start: s.toISOString(), doctorId: slot.doctorId, facilityId: slot.facilityId });
      }
    }
  }
  // sort by start
  suggestions.sort((a, b) => a.start.localeCompare(b.start));
  return Response.json({ suggestions });
}


