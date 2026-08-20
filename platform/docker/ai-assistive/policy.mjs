const prohibitedClinicalTerms = ["diagnóstic", "diagnostic", "prognóst", "prognostic", "prescrev", "dose", "dosagem", "posologia", "tratamento", "cura"];

function assertSafeText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  const normalized = value.toLocaleLowerCase("pt-BR");
  if (prohibitedClinicalTerms.some((term) => normalized.includes(term))) {
    throw new Error(`${label} contains prohibited clinical content.`);
  }
}

export function createContainerAssistiveRequest({ records }) {
  if (!Array.isArray(records) || records.length === 0) throw new Error("At least one synthetic record is required.");
  const normalizedRecords = records.map((record) => {
    if (!record?.synthetic) throw new Error("Only synthetic authorized records are accepted by the container gateway.");
    assertSafeText(record.recordId, "recordId");
    assertSafeText(record.title, "title");
    assertSafeText(record.sourceName, "sourceName");
    return { recordId: record.recordId, title: record.title, sourceName: record.sourceName, synthetic: true };
  });

  return {
    messages: [
      {
        role: "system",
        content: "Você é um assistente de organização de registros sintéticos. Produza somente fatos presentes nos dados recebidos. Não diagnostique, não prescreva, não indique tratamento, não sugira dose e não tome decisão clínica. Cada item deve referenciar apenas um recordId recebido.",
      },
      { role: "user", content: JSON.stringify({ task: "Resuma cada registro em uma frase factual com sua origem.", records: normalizedRecords }) },
    ],
    responseSchema: {
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
  };
}

export function assertContainerOutputSafe(payload) {
  if (!payload || !Array.isArray(payload.items)) throw new Error("Container model output is invalid.");
  for (const item of payload.items) {
    assertSafeText(item?.recordId, "recordId");
    assertSafeText(item?.text, "model output");
  }
  return payload;
}
