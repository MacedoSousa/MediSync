import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { assertContainerOutputSafe, createContainerAssistiveRequest } from "./policy.mjs";

const port = Number(process.env.PORT ?? 8088);
const llmBaseUrl = (process.env.LLM_BASE_URL ?? "http://llm:8080/v1").replace(/\/$/, "");
const configuredToken = process.env.ASSISTIVE_GATEWAY_TOKEN ?? "";

function send(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

function isAuthorized(request) {
  if (!configuredToken) return true;
  const candidate = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = Buffer.from(configuredToken);
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.length > 64_000) throw new Error("Request body is too large.");
  return JSON.parse(raw || "{}");
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/healthz") return send(response, 200, { status: "ok", service: "medsync-assistive-gateway" });
  if (request.method !== "POST" || request.url !== "/v1/assistive-summary") return send(response, 404, { error: "not_found" });
  if (!isAuthorized(request)) return send(response, 401, { error: "unauthorized" });

  try {
    const body = await readJson(request);
    const modelRequest = createContainerAssistiveRequest({ records: body.records });
    const modelResponse = await fetch(`${llmBaseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.LLM_MODEL ?? "medsync-assistive", temperature: 0, messages: modelRequest.messages, response_format: { type: "json_schema", json_schema: { name: "assistive_summary", strict: true, schema: modelRequest.responseSchema } } }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!modelResponse.ok) throw new Error("Local model is unavailable.");
    const modelPayload = await modelResponse.json();
    const content = modelPayload?.choices?.[0]?.message?.content;
    const summary = assertContainerOutputSafe(JSON.parse(content));
    return send(response, 200, { mode: "container_model", summary });
  } catch {
    return send(response, 503, {
      error: "assistive_model_unavailable",
      fallback: "Use the deterministic MedSync summary. Emergency access must use the local SAMU 192 path, never this model.",
    });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`MedSync assistive gateway listening on ${port}`));
