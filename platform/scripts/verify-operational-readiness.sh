#!/usr/bin/env bash
set -euo pipefail

pnpm check
pnpm test

if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/api/health >/dev/null; then
  echo "API health check: OK"
else
  echo "API health check: indisponível; revise o serviço antes de liberar alterações." >&2
  exit 1
fi
