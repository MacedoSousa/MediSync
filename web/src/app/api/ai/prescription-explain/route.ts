import { authOptions } from "@/auth";
import NextAuth from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const Schema = z.object({ prescriptionText: z.string().min(5) });

export async function POST(req: Request) {
  const sessionHandler = NextAuth(authOptions);
  const res = await sessionHandler(req);
  if (res.status === 401) return res;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const { prescriptionText } = parsed.data;

  const prompt = `Explique em linguagem simples e com avisos de segurança a seguinte prescrição médica. Não dê diagnóstico; enfatize seguir orientação do médico e farmacêutico.\n\n${scrubPII(prescriptionText)}`;
  if (!client) {
    const fallback = `Explicação (modo local): siga horários e dosagens conforme prescrição. Tire dúvidas com seu médico e farmacêutico.`;
    return Response.json({ explanation: fallback });
  }
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  return Response.json({ explanation: completion.output_text || "" });
}


