export type ApiBaseUrlRuntime = {
  configuredUrl: string;
  nativeHostUri: string | null;
  platform: "android" | "ios" | "web";
  webOrigin: string | null;
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

/** Seleciona uma origem utilizável de ambiente e ignora deep links do próprio app. */
export function selectNativeApiHost(candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;

    try {
      const normalized = candidate.includes("://") ? candidate : `https://${candidate}`;
      const parsed = new URL(normalized.replace(/^exp:/, "http:"));
      if (parsed.hostname) return candidate;
    } catch {
      // Ignora URLs inválidas e continua com a próxima origem disponível.
    }
  }

  return null;
}

const deriveApiUrl = (value: string) => {
  const normalized = value.includes("://") ? value : `https://${value}`;
  const parsed = new URL(normalized.replace(/^exp:/, "http:"));
  parsed.hostname = parsed.hostname.replace(/^8081-/, "3000-");
  if (parsed.port === "8081") {
    parsed.port = "3000";
  }

  return normalizeBaseUrl(parsed.origin);
};

/** Resolve uma URL absoluta da API; runtimes nativos nunca recebem URL relativa. */
export function resolveApiBaseUrl(runtime: ApiBaseUrlRuntime): string {
  if (runtime.configuredUrl.trim()) {
    return normalizeBaseUrl(runtime.configuredUrl.trim());
  }

  if (runtime.platform === "web" && runtime.webOrigin) {
    return deriveApiUrl(runtime.webOrigin);
  }

  if (runtime.nativeHostUri) {
    return deriveApiUrl(runtime.nativeHostUri);
  }

  return "";
}
