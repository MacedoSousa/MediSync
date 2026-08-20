# Operação do MedSync

## Ambientes

| Ambiente | Dados permitidos | Objetivo |
|---|---|---|
| Desenvolvimento | Somente sintéticos, rotulados e determinísticos. | Desenvolvimento local e regressão. |
| Homologação | Sintéticos ou anonimizados sob aprovação. | Testes de integração e aceitação. |
| Produção | Dados reais somente após controles formais. | Operação institucional autorizada. |

## Banco e migrações

O projeto utiliza Drizzle e MySQL compatível. Migrações são versionadas em `drizzle/` e devem ser revisadas antes de aplicação. Não use comandos destrutivos em produção. Faça backup cifrado e teste restauração antes de qualquer atualização de esquema.

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Verificação de qualidade

| Comando | Finalidade |
|---|---|
| `pnpm test` | Testes unitários, contratos e regressões. |
| `pnpm check` | Verificação TypeScript sem emissão. |
| `pnpm lint` | Análise estática Expo/ESLint. |
| `pnpm dev` | API e Metro/preview para desenvolvimento. |

Antes de um checkpoint ou merge, execute `pnpm test && pnpm check` e revise `todo.md`.

## Docker

`docker/compose.yaml` descreve serviços isolados de banco MySQL, API e interface Web. O ambiente temporário de desenvolvimento pode não disponibilizar o executável Docker; valide e execute a composição em máquina ou VM persistente com Docker instalado. O arquivo `.env.docker.example` contém nomes de variáveis, nunca valores secretos.

## Observabilidade

 Use identificador de correlação para requisições, erros estruturados sem PII/PHI e verificação periódica de integridade da auditoria. Monitore indisponibilidade da API, falhas de autenticação, rejeições de autorização, falha de chave de cifragem e desativação da IA. Não registre token, documento, endereço, prontuário, resultado ou conteúdo de conversa em logs.
