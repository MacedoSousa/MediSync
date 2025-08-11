import { prisma } from "@/lib/db";
import { requireSession, type SessionWithRole } from "@/lib/authz";
import { z } from "zod";

const PatchSchema = z.object({
  facilityId: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  calendarUrl: z.string().url().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  licenseAuthority: z.string().nullable().optional(),
  licenseCountry: z.string().nullable().optional(),
  licenseExpiresAt: z.string().datetime().nullable().optional(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
});

export async function GET(req: Request) {
  const id = new URL(req.url).pathname.split("/").pop() as string;
  const doc = await prisma.doctor.findUnique({ where: { id }, include: { user: true, facility: true } });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ doctor: doc });
}

export async function PATCH(req: Request) {
  const id = new URL(req.url).pathname.split("/").pop() as string;
  const auth = await requireSession(["ADMIN", "DOCTOR"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  // If role is DOCTOR, ensure editing own profile
  const s = auth.session as SessionWithRole;
  const role = s.user.role;
  if (role === "DOCTOR") {
    const me = await prisma.doctor.findFirst({ where: { userId: s.user.id } });
    if (!me || me.id !== id) return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = parsed.data;
  const updated = await prisma.doctor.update({
    where: { id },
    data: {
      facilityId: data.facilityId ?? undefined,
      specialization: data.specialization ?? undefined,
      calendarUrl: data.calendarUrl ?? undefined,
      licenseNumber: data.licenseNumber ?? undefined,
      licenseAuthority: data.licenseAuthority ?? undefined,
      licenseCountry: data.licenseCountry ?? undefined,
      licenseExpiresAt: data.licenseExpiresAt ? new Date(data.licenseExpiresAt) : undefined,
      verificationStatus: data.verificationStatus ?? undefined,
    },
  });
  return Response.json({ doctor: updated });
}


