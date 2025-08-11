import { authOptions } from "@/auth";
import NextAuth from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

const Schema = z.object({
  symptoms: z.string().min(3),
  context: z.string().optional(),
});

export async function POST(req: Request) {
  const sessionHandler = NextAuth(authOptions);
  const res = await sessionHandler(req);
  if (res.status === 401) return res;

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const { symptoms, context } = parsed.data;

  const prompt = `Sintomas: ${scrubPII(symptoms)}\nContexto: ${scrubPII(context ?? "")}\n\nDê uma triagem inicial (não é diagnóstico) e recomende se deve procurar clínico geral, especialista ou emergência.`;

  if (!client) {
    const base = `Triagem (modo local): sintomas recebidos. Se piora súbita, procure emergência. Para avaliação inicial, procure Clínico Geral.`;
    return Response.json({ triage: base });
  }
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  const text = completion.output_text || "";
  return Response.json({ triage: text });
}


