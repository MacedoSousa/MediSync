import { authOptions } from "@/auth";
import NextAuth from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const Schema = z.object({ symptoms: z.string().min(3) });

export async function POST(req: Request) {
  const sessionHandler = NextAuth(authOptions);
  const res = await sessionHandler(req);
  if (res.status === 401) return res;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const prompt = `Dado os sintomas a seguir, sugira UMA especialidade médica mais adequada para o primeiro atendimento. Responda apenas o nome da especialidade.\n\nSintomas: ${scrubPII(parsed.data.symptoms)}`;
  if (!client) {
    // Heurística simples local
    const s = parsed.data.symptoms.toLowerCase();
    const specialty = s.includes("dor no peito") || s.includes("pressão") ? "Cardiologia" : s.includes("pele") ? "Dermatologia" : "Clínico Geral";
    return Response.json({ specialty });
  }
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{ role: "user", content: prompt }],
    temperature: 0,
  });
  return Response.json({ specialty: (completion.output_text || "").trim() });
}


