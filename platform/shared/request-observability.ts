const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveCorrelationId(candidate: unknown, createId: () => string): string {
  return typeof candidate === "string" && UUID_V4_PATTERN.test(candidate) ? candidate : createId();
}

function normalizeRoute(url: string): string {
  const pathname = url.split("?")[0] ?? "/";
  if (pathname.startsWith("/api/trpc")) return "/api/trpc";
  return pathname;
}

export function createSafeRequestLog(input: { method: string; url: string; statusCode: number; durationMs: number; correlationId: string }) {
  return {
    event: "http_request_completed" as const,
    method: input.method,
    route: normalizeRoute(input.url),
    statusCode: input.statusCode,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    correlationId: input.correlationId,
  };
}
