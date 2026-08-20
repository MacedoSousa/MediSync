# Execução local com Docker

Esta composição separa o banco MySQL, a API Node/tRPC e a interface Web exportada pelo Expo. Ela é destinada a um computador ou servidor com Docker; o ambiente temporário de desenvolvimento não deve hospedar dados reais nem serviços persistentes.

## Preparação

Copie `.env.docker.example` para `.env`, gere senhas exclusivas e configure uma chave `MEDSYNC_FIELD_ENCRYPTION_KEY` própria para o ambiente. Nunca registre o arquivo `.env` no repositório e nunca reutilize chaves de produção em desenvolvimento.

```bash
cp .env.docker.example .env
docker compose -f docker/compose.yaml --env-file .env up --build
```

A interface Web será exposta em `http://localhost:8080`, a API em `http://localhost:3000` e o MySQL na porta configurada. A API somente é iniciada após o health check do MySQL e aplica as migrações Drizzle antes de atender requisições.

## Limites de operação

O volume `medsync_mysql` preserva dados entre reinicializações locais. Para limpar exclusivamente dados de demonstração, interrompa a composição e remova o volume explicitamente; isso é destrutivo. A composição não habilita envio de SMS, notificações, contatos de emergência ou integrações clínicas reais. Esses recursos exigem consentimento, homologação e credenciais próprias.
