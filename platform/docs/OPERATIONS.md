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

Cada requisição HTTP recebe ou preserva o cabeçalho `X-Correlation-Id` no formato UUID v4. O servidor emite, no encerramento da requisição, um evento JSON com método, rota normalizada, status, duração e o mesmo identificador. Parâmetros, cabeçalhos, corpo, token, documento, endereço, prontuário, resultado e conteúdo de conversa nunca entram nesse evento.

Monitore indisponibilidade da API, falhas de autenticação, rejeições de autorização, falha de chave de cifragem, desativação da IA e eventos de resposta bloqueada. Para investigação, use o identificador de correlação e a trilha de auditoria, sem copiar dados de saúde para tickets, mensagens ou logs.

## Resposta a incidentes

| Situação | Ação imediata | Preservação e recuperação |
|---|---|---|
| Suspeita de acesso indevido | Suspender a sessão ou delegação afetada, registrar o horário e o identificador de correlação. | Preservar a cadeia de auditoria; revisar permissões, consentimentos e eventos de acesso sem exportar PHI. |
| Indisponibilidade de API | Acionar o fluxo local de emergência quando necessário; não direcionar urgência à IA. | Consultar `/api/health`, revisar eventos sanitizados e reiniciar somente o serviço afetado após confirmar a causa. |
| Falha de cifragem ou segredo | Interromper a operação que depende da chave e impedir novas escritas sensíveis. | Rotacionar o segredo por canal seguro, validar em ambiente isolado e testar leitura de dados já cifrados antes de retomar. |
| Comportamento assistivo inseguro | Desabilitar a regra no painel administrativo e registrar revisão humana. | Manter a contingência local ativa, revisar a regra/versionamento e só reabilitar após aprovação formal. |

> A recuperação nunca deve usar `DROP`, recriação do banco ou sobrescrita de dados como primeira medida. Faça uma restauração cifrada em ambiente isolado, compare a integridade da cadeia de auditoria e só então planeje o retorno controlado.

## Verificação de recuperação

O comando abaixo verifica de forma não destrutiva a tipagem, a regressão e a resposta de saúde. Ele deve ser executado em desenvolvimento e homologação após restauração, alteração de infraestrutura ou atualização de dependências:

```bash
./scripts/verify-operational-readiness.sh
```
