# MediSync

Integração entre médicos, pacientes e farmácias, com foco em segurança, privacidade e IA.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind v4
- Prisma + PostgreSQL (Docker)
- NextAuth v4 (Credenciais, Google, Microsoft) + Prisma Adapter
- OpenAI (triagem, resumos, especialidade, instruções, explicação de prescrição)
- LocalStack (S3/SES/SNS/SQS) para ambiente local
- SQS Worker para notificações assíncronas

## Pré-requisitos
- Docker / Docker Compose
- Node 18+

## Inicialização rápida
1. Suba infraestrutura local:
   ```bash
   docker compose up -d
   ```
2. Configure variáveis em `web/.env` (já contém placeholders):
   - Banco: `DATABASE_URL`
   - Segredos: `AUTH_SECRET`, `DATA_ENCRYPTION_KEY`
   - OpenAI: `OPENAI_API_KEY` e `OPENAI_MODEL` (ex.: `gpt-4o-mini`)
   - OAuth Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - OAuth Microsoft (Azure AD): `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
   - AWS Local: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL`, `NOTIFY_FROM_EMAIL`
   - Notificações: `NOTIFY_QUEUE_URL` (já setada p/ LocalStack)
   - Opcional (dev): `GOOGLE_ACCESS_TOKEN`, `MS_GRAPH_ACCESS_TOKEN` p/ gerar reuniões online.
3. App web (primeiro setup):
   ```bash
   cd web
   npx prisma generate
   npx prisma migrate deploy
   npm install
   npm run dev
   ```
4. Worker de notificações (em outro terminal):
   ```bash
   cd web
   npx prisma db seed
   npm run worker
   ```
5. Health check:
   - `http://localhost:3000/api/health` → `{ ok: true }`

## Autenticação
- Provedores:
  - Credenciais (email/senha argon2)
  - Google (OAuth) – callback: `http://localhost:3000/api/auth/callback/google`
  - Microsoft (Azure AD) – callback: `http://localhost:3000/api/auth/callback/azure-ad`
- Página de login: `http://localhost:3000/login`

## Modelos (Prisma)
- Usuários (`User`) com `role`: `ADMIN`, `DOCTOR`, `PATIENT`, `PHARMACY_ADMIN`.
- Médicos, Pacientes, Unidades (`Facility`), Agenda/Disponibilidade, Consultas (`Appointment`), Prescrições (`Prescription`), Pedidos de Exame (`ExamOrder`).
- Verificação profissional: `verificationStatus` e campos de licença/registro.
- Campos cifrados em repouso: `Prescription.encryptedContent`, `ExamOrder.encryptedResult`, `Appointment.notesEncrypted` (AES-256-GCM via `DATA_ENCRYPTION_KEY`).

## IA
- Rotas (protegidas):
  - `POST /api/ai/triage` – triagem inicial
  - `POST /api/ai/summarize` – resumo clínico
  - `POST /api/ai/specialty` – especialidade sugerida
  - `POST /api/ai/instructions` – instruções de preparo
  - `POST /api/ai/prescription-explain` – explicação de prescrição
- Sanitização de PII nos prompts (`src/lib/pii.ts`).

## Agenda e consultas
- Disponibilidade (`AvailabilitySlot`):
  - `GET /api/availability?doctorId=&facilityId=`
  - `POST /api/availability` (ADMIN/DOCTOR)
  - `PATCH /api/availability/[id]` (ADMIN/DOCTOR)
  - `DELETE /api/availability/[id]` (ADMIN/DOCTOR)
  - `GET /api/availability/suggest?date=YYYY-MM-DD&doctorId=&facilityId=`
- Consultas (`Appointment`):
  - `GET /api/appointments` – por papel (paciente, médico, admin)
  - `POST /api/appointments` – cria consulta (30 min), valida slot/capacidade
  - Modo ONLINE: tenta gerar `meetingUrl` (Google Meet ou Microsoft Teams) se tokens dev presentes

## Integrações de calendário (dev)
- Google Calendar/Meet:
  - Escopos: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`
  - Configure OAuth no Google Cloud; obtenha `access_token` para dev e preencha `GOOGLE_ACCESS_TOKEN`.
- Microsoft Teams (Graph):
  - Escopo: `OnlineMeetings.ReadWrite`
  - Configure App no Azure; obtenha `access_token` e preencha `MS_GRAPH_ACCESS_TOKEN`.
- Produção: armazenar e renovar tokens por usuário (futuro) e respeitar consentimento/escopo mínimos.

## Notificações
- Síncrono (dev):
  - `POST /api/notify/email` (SES local)
  - `POST /api/notify/sms` (SNS local)
- Assíncrono:
  - `POST /api/notify/queue` – adiciona job na fila SQS `medisync-notify`
  - Worker: `src/worker/notify.ts` (processa e envia e-mail/SMS via LocalStack)

## Segurança e privacidade
- Criptografia AES-256-GCM para dados sensíveis em DB.
- Senhas com `argon2`.
- RBAC por `role` em rotas.
- PII scrubbing em prompts de IA.
- Próximos passos: E2E para anexos (S3), KMS para rotação de chaves, audit log.

## Scripts úteis
```bash
# Infra
docker compose up -d

# App
cd web
npm run dev
npm run build

# Worker
npm run worker
```

## Estrutura (parcial)
- `docker-compose.yml` – Postgres e LocalStack
- `web/prisma/schema.prisma` – schema de dados
- `web/src/auth.ts` – NextAuth
- `web/src/lib/db.ts` – Prisma client + criptografia
- `web/src/lib/crypto.ts` – AES-GCM helpers
- `web/src/lib/aws.ts` – clientes AWS (LocalStack)
- `web/src/lib/templates.ts` – templates de e-mail
- `web/src/lib/google.ts` / `web/src/lib/microsoft.ts` – integrações
- `web/src/worker/notify.ts` – worker SQS
- `web/src/app/api/*` – rotas

## Observações
- LocalStack simula serviços AWS; não envia e-mails/SMS reais.
- Sem `OPENAI_API_KEY`, as rotas de IA respondem com stubs locais para desenvolvimento.
- Para OAuth Google/Microsoft, crie apps nas consoles e preencha o `.env`.
- Em produção: usar domínios verificados (SES), credenciais gerenciadas (KMS/Secrets Manager), e políticas mínimas.
