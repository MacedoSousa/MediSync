import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authz";
import { z } from "zod";

const CreateSchema = z.object({
  userId: z.string(),
  facilityId: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  calendarUrl: z.string().url().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  licenseAuthority: z.string().nullable().optional(),
  licenseCountry: z.string().nullable().optional(),
  licenseExpiresAt: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const doctors = await prisma.doctor.findMany({ include: { user: true, facility: true } });
  return Response.json({ doctors });
}

export async function POST(req: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const data = parsed.data;
  const created = await prisma.doctor.create({
    data: {
      userId: data.userId,
      facilityId: data.facilityId ?? undefined,
      specialization: data.specialization ?? undefined,
      calendarUrl: data.calendarUrl ?? undefined,
      licenseNumber: data.licenseNumber ?? undefined,
      licenseAuthority: data.licenseAuthority ?? undefined,
      licenseCountry: data.licenseCountry ?? undefined,
      licenseExpiresAt: data.licenseExpiresAt ? new Date(data.licenseExpiresAt) : undefined,
    },
  });
  return Response.json({ doctor: created });
}


