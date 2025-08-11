import { SESv2Client } from "@aws-sdk/client-sesv2";
import { SNSClient } from "@aws-sdk/client-sns";
import { SQSClient, CreateQueueCommand } from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.AWS_ENDPOINT_URL || "http://localhost:4566";

const common = {
  region,
  endpoint,
  forcePathStyle: true as unknown as undefined,
};

export const ses = new SESv2Client(common);
export const sns = new SNSClient(common);
export const sqs = new SQSClient(common);
export const s3 = new S3Client(common);

function getQueueNameFromUrl(url: string): string | null {
  try {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export async function ensureQueueExists(queueUrl?: string): Promise<void> {
  const url = queueUrl || process.env.NOTIFY_QUEUE_URL || "http://localhost:4566/000000000000/medisync-notify";
  const name = getQueueNameFromUrl(url);
  if (!name) return;
  try {
    await sqs.send(new CreateQueueCommand({ QueueName: name }));
  } catch {
    // ignore if already exists or LocalStack not ready yet; caller can retry
  }
}


