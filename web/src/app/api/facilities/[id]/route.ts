import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authz";
import { z } from "zod";

const PatchSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["CLINIC", "HOSPITAL", "PHARMACY"]).optional(),
  address: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
});

export async function GET(req: Request) {
  const id = new URL(req.url).pathname.split("/").pop() as string;
  const fac = await prisma.facility.findUnique({ where: { id } });
  if (!fac) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ facility: fac });
}

export async function PATCH(req: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const id = new URL(req.url).pathname.split("/").pop() as string;
  const updated = await prisma.facility.update({ where: { id }, data: parsed.data });
  return Response.json({ facility: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const id = new URL(req.url).pathname.split("/").pop() as string;
  await prisma.facility.delete({ where: { id } });
  return Response.json({ ok: true });
}


