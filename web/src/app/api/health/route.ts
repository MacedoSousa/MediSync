import { prisma } from "@/lib/db";
import { ensureQueueExists } from "@/lib/aws";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return Response.json({ ok: false, db: false }, { status: 500 });
  }
  await ensureQueueExists().catch(() => {});
  return Response.json({ ok: true });
}

import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}


