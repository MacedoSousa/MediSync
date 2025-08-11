import { requireSession } from "@/lib/authz";
import { z } from "zod";
import { sqs, ensureQueueExists } from "@/lib/aws";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

const EmailSchema = z.object({ kind: z.literal("email"), to: z.string().email(), subject: z.string().min(1), html: z.string().optional(), text: z.string().optional() });
const SmsSchema = z.object({ kind: z.literal("sms"), phone: z.string().min(8), message: z.string().min(1).max(1600) });
const Schema = z.union([EmailSchema, SmsSchema]);

export async function POST(req: Request) {
  const auth = await requireSession(["ADMIN", "DOCTOR", "PHARMACY_ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const QueueUrl = process.env.NOTIFY_QUEUE_URL || "http://localhost:4566/000000000000/medisync-notify";
  await ensureQueueExists(QueueUrl).catch(() => {});
  await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify(parsed.data) }));
  return Response.json({ enqueued: true });
}


