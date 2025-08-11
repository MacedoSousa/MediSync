import { authOptions } from "@/auth";
import NextAuth from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

const Schema = z.object({
  text: z.string().min(5),
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
  const { text } = parsed.data;
  const prompt = `Resumo clínico objetivo (sem PII, sem diagnóstico):\n\n${scrubPII(text)}`;

  if (!client) {
    const fallback = `Resumo (modo local): ${text.slice(0, 180)}...`;
    return Response.json({ summary: fallback });
  }
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  const summary = completion.output_text || "";
  return Response.json({ summary });
}


