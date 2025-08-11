import { sqs } from "@/lib/aws";
import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { PublishCommand } from "@aws-sdk/client-sns";
import { ses, sns, ensureQueueExists } from "@/lib/aws";
import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const QUEUE_URL = process.env.NOTIFY_QUEUE_URL || "http://localhost:4566/000000000000/medisync-notify";
const FROM = process.env.NOTIFY_FROM_EMAIL || "no-reply@medisync.local";

type Job =
  | { kind: "email"; to: string; subject: string; html?: string; text?: string }
  | { kind: "sms"; phone: string; message: string };

async function poll() {
  await ensureQueueExists(QUEUE_URL).catch(() => {});
  while (true) {
    const resp = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10,
    }));
    const messages = resp.Messages || [];
    for (const m of messages) {
      try {
        const body = m.Body ? JSON.parse(m.Body) : null;
        const job = body as Job;
        if (job?.kind === "email") {
          await ses.send(new SendEmailCommand({
            FromEmailAddress: FROM,
            Destination: { ToAddresses: [job.to] },
            Content: { Simple: { Subject: { Data: job.subject }, Body: job.html ? { Html: { Data: job.html } } : { Text: { Data: job.text || job.subject } } } },
          }));
        } else if (job?.kind === "sms") {
          await sns.send(new PublishCommand({ PhoneNumber: job.phone, Message: job.message }));
        }
        if (m.ReceiptHandle) {
          await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle }));
        }
      } catch {
        // keep message for retry by visibility timeout
      }
    }
  }
}

poll().catch((e) => {
  console.error("Worker error", e);
  process.exit(1);
});


