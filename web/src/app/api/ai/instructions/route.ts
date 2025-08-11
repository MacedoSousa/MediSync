import { authOptions } from "@/auth";
import NextAuth from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const Schema = z.object({ procedure: z.string().min(2), context: z.string().optional() });

export async function POST(req: Request) {
  const sessionHandler = NextAuth(authOptions);
  const res = await sessionHandler(req);
  if (res.status === 401) return res;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const { procedure, context } = parsed.data;

  const prompt = `Gere instruções claras e objetivas de preparo para o procedimento/exame abaixo, em tópicos, sem diagnóstico, e com alertas de segurança quando aplicável.\nProcedimento: ${scrubPII(procedure)}\nContexto: ${scrubPII(context ?? "")}\nSaída em português.`;
  if (!client) {
    const fallback = `Instruções (modo local): jejum conforme orientação, levar documentos; chegar 15 minutos antes.`;
    return Response.json({ instructions: fallback });
  }
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  return Response.json({ instructions: completion.output_text || "" });
}


