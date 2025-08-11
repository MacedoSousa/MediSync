import { requireSession } from "@/lib/authz";
import { z } from "zod";
import { ses, ensureQueueExists } from "@/lib/aws";
import { SendEmailCommand } from "@aws-sdk/client-sesv2";

const Schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
});

export async function POST(req: Request) {
  await ensureQueueExists().catch(() => {});
  const auth = await requireSession(["ADMIN", "DOCTOR", "PHARMACY_ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const from = process.env.NOTIFY_FROM_EMAIL || "no-reply@medisync.local";
  const { to, subject, html, text } = parsed.data;

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: html ? { Html: { Data: html } } : { Text: { Data: text || subject } },
        },
      },
    }));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "SES send failed (local)" }, { status: 500 });
  }
}


