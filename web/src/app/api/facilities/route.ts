import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireSession } from "@/lib/authz";

const FacilitySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["CLINIC", "HOSPITAL", "PHARMACY"]),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  registrationNumber: z.string().optional(),
});

export async function GET() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });
  return Response.json({ facilities });
}

export async function POST(req: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = FacilitySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const data = parsed.data;
  const created = await prisma.facility.create({ data });
  return Response.json({ facility: created });
}


