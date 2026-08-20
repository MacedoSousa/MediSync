import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl, selectNativeApiHost } from "../shared/api-base-url";

describe("resolveApiBaseUrl", () => {
  it("prioriza uma URL de API configurada e remove a barra final", () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: "https://api.medsync.example/",
        nativeHostUri: null,
        platform: "ios",
        webOrigin: null,
      }),
    ).toBe("https://api.medsync.example");
  });

  it("deriva a API no preview Web a partir da porta do servidor", () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: "",
        nativeHostUri: null,
        platform: "web",
        webOrigin: "https://8081-ambiente.us3.manus.computer",
      }),
    ).toBe("https://3000-ambiente.us3.manus.computer");
  });

  it("deriva a API no Expo Go sem enviar URLs relativas ao runtime nativo", () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: "",
        nativeHostUri: "8081-ambiente.us3.manus.computer",
        platform: "android",
        webOrigin: null,
      }),
    ).toBe("https://3000-ambiente.us3.manus.computer");
  });

  it("substitui a porta do Metro pela porta da API no Expo Go local", () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: "",
        nativeHostUri: "exp://192.168.0.15:8081",
        platform: "android",
        webOrigin: null,
      }),
    ).toBe("http://192.168.0.15:3000");
  });

  it("ignora um deep link sem host e preserva a origem remota do ambiente", () => {
    expect(
      selectNativeApiHost([
        "manusmedsync:///oauth/callback",
        "https://8081-ambiente.us3.manus.computer",
      ]),
    ).toBe("https://8081-ambiente.us3.manus.computer");
  });
});
