import { requireSession } from "@/lib/authz";
import { z } from "zod";
import { sns } from "@/lib/aws";
import { PublishCommand } from "@aws-sdk/client-sns";

const Schema = z.object({
  phone: z.string().min(8),
  message: z.string().min(1).max(1600),
});

export async function POST(req: Request) {
  const auth = await requireSession(["ADMIN", "DOCTOR", "PHARMACY_ADMIN"]);
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const { phone, message } = parsed.data;
  try {
    await sns.send(new PublishCommand({ PhoneNumber: phone, Message: message }));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "SNS publish failed (local)" }, { status: 500 });
  }
}


