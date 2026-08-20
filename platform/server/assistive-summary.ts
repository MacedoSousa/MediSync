import {
  ASSISTIVE_SUMMARY_SCHEMA_VERSION,
  createAssistiveSummary,
  validateAssistiveSummary,
  type AssistiveSummary,
} from "../shared/assistive-summary";
import { assertAssistiveAgentEnabled, evaluateAssistiveContent } from "../shared/assistive-governance";
import type { HealthTimelineEntry } from "../shared/health-domain";
import { invokeLLM } from "./_core/llm";
import { getAssistiveAgentControl } from "./assistive-governance";

const model = "gpt-5-mini";

type ModelSummary = {
  items: Array<{ recordId: string; text: string }>;
};

function parseModelSummary(content: unknown): ModelSummary {
  if (typeof content !== "string") throw new Error("Assistive summary model did not return text.");
  const parsed = JSON.parse(content) as unknown;
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { items?: unknown }).items)) {
    throw new Error("Assistive summary model response is invalid.");
  }
  return parsed as ModelSummary;
}

export async function generateAssistiveSummary(input: {
  patientId: string;
  authorizedSyntheticRecords: readonly HealthTimelineEntry[];
  generatedAt: Date;
}): Promise<{ summary: AssistiveSummary; mode: "model" | "deterministic_fallback" }> {
  assertAssistiveAgentEnabled(getAssistiveAgentControl());
  const fallback = createAssistiveSummary({
    patientId: input.patientId,
    records: input.authorizedSyntheticRecords,
    generatedAt: input.generatedAt,
  });

  try {
    const result = await invokeLLM({
      model,
      maxTokens: 700,
      messages: [
        {
          role: "system",
          content: "Você é um assistente de organização de registros de demonstração em saúde. Produza somente um resumo factual dos registros recebidos. Não diagnostique, não prescreva, não sugira dose, não estime risco, não indique tratamento, não use linguagem de certeza clínica e não crie fatos. Cada item deve mencionar apenas um recordId recebido.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Liste, em uma frase por registro, o que está disponível para revisão na origem declarada.",
            records: input.authorizedSyntheticRecords.map((record) => ({
              recordId: record.id,
              category: record.category,
              title: record.title,
              occurredAt: record.occurredAt,
              sourceName: record.provenance.sourceName,
              sourceRecordedAt: record.provenance.recordedAt,
              synthetic: true,
            })),
          }),
        },
      ],
      outputSchema: {
        name: "assistive_summary_items",
        strict: true,
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: { recordId: { type: "string" }, text: { type: "string" } },
                required: ["recordId", "text"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    });
    const generated = parseModelSummary(result.choices[0]?.message.content);
    const recordsById = new Map(input.authorizedSyntheticRecords.map((record) => [record.id, record]));
    const candidate = {
      schemaVersion: ASSISTIVE_SUMMARY_SCHEMA_VERSION,
      patientId: input.patientId,
      generatedAt: input.generatedAt.toISOString(),
      disclaimer: "Resumo assistivo de dados sintéticos autorizados. Não fornece diagnóstico, prescrição, dose ou decisão clínica.",
      items: generated.items.map((item) => {
        const record = recordsById.get(item.recordId);
        if (!record) throw new Error("Assistive summary references an unauthorized record.");
        return { recordId: item.recordId, text: item.text, evidence: [record.provenance] };
      }),
    };
    for (const item of candidate.items) {
      const review = evaluateAssistiveContent(item.text);
      if (!review.allowed) throw new Error("Assistive summary contains prohibited clinical content.");
    }
    validateAssistiveSummary(candidate, input.authorizedSyntheticRecords);
    return { summary: candidate, mode: "model" };
  } catch {
    for (const item of fallback.items) {
      const review = evaluateAssistiveContent(item.text);
      if (!review.allowed) throw new Error("Deterministic assistive fallback violates the safety policy.");
    }
    return { summary: fallback, mode: "deterministic_fallback" };
  }
}
