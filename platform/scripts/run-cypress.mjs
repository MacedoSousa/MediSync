import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const projectRoot = process.cwd();
const staticDirectory = resolve(projectRoot, ".cypress-web");
const port = Number(process.env.CYPRESS_PORT ?? 4173);
const baseUrl = process.env.CYPRESS_BASE_URL ?? `http://127.0.0.1:${port}`;
const exportArguments = ["exec", "expo", "export", "--platform", "web"];

if (process.env.CYPRESS_EXPORT_DEV === "true") {
  exportArguments.push("--dev");
}

exportArguments.push("--output-dir", ".cypress-web", "--max-workers", "1");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function run(command, args, extraEnv = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...extraEnv },
      stdio: "inherit",
    });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} finalizou com código ${code ?? "desconhecido"}.`));
    });
  });
}

function resolveStaticFile(urlPathname) {
  const requestedPath = decodeURIComponent(urlPathname === "/" ? "/index.html" : urlPathname);
  const candidate = normalize(join(staticDirectory, requestedPath));
  if (!candidate.startsWith(staticDirectory)) {
    return join(staticDirectory, "index.html");
  }
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const routeHtmlCandidate = `${candidate}.html`;
  if (routeHtmlCandidate.startsWith(staticDirectory) && existsSync(routeHtmlCandidate) && statSync(routeHtmlCandidate).isFile()) {
    return routeHtmlCandidate;
  }

  return join(staticDirectory, "index.html");
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", baseUrl);
    const filePath = resolveStaticFile(requestUrl.pathname);

    if (!existsSync(filePath)) {
      response.writeHead(404).end("Exportação Web não encontrada.");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  });
}

async function main() {
  if (!process.env.CYPRESS_BASE_URL) {
    await run("pnpm", exportArguments);
  }

  const server = createStaticServer();
  await new Promise((resolvePromise) => server.listen(port, "127.0.0.1", resolvePromise));

  try {
    await run(process.execPath, ["node_modules/cypress/bin/cypress", "run", "--browser", "electron"], {
      CYPRESS_BASE_URL: baseUrl,
      CYPRESS_NUM_TESTS_KEPT_IN_MEMORY: "0",
    });
  } finally {
    await new Promise((resolvePromise) => server.close(resolvePromise));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
