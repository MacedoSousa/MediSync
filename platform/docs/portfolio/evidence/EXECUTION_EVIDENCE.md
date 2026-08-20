# Provas de Execução / Execution Evidence

**Data de referência / Reference date:** 20 de agosto de 2026  
**Ambiente / Environment:** Linux sandbox para validação automatizada; Docker Desktop em Windows para a composição local documentada.  
**Dados / Data:** somente conteúdo sintético de demonstração; nenhum dado clínico real foi usado.

## Registros verificáveis

| Evidência | Comando executado | Resultado observado |
|---|---|---|
| Regressão Web ponta a ponta / Web E2E regression | `pnpm test:e2e` | **4 testes aprovados**, sem falhas. |
| Captura mobile / Mobile capture | Cenário Cypress `web-home-mobile` | Arquivo `cypress/medsync-web.cy.ts/web-home-mobile.png`, 390 × 720. |
| Captura desktop / Desktop capture | Cenário Cypress `web-care-explorer-desktop` | Arquivo `cypress/medsync-web.cy.ts/web-care-explorer-desktop.png`, 1280 × 720. |
| Integridade do vídeo / Video integrity | `ffprobe` | H.264, 1280 × 720, áudio AAC, duração de 8 segundos. |
| Regressão de domínio / Domain regression | `pnpm test` | 43 arquivos e 105 testes aprovados no relatório de validação. |
| Tipagem e lint / Types and lint | `pnpm check` e `pnpm lint` | Sem erros no marco de automação documentado. |

## Comandos de reprodução

```bash
# Instala dependências e inicia o ambiente de desenvolvimento
pnpm install
pnpm dev

# Executa qualidade de código e contratos
pnpm test
pnpm check
pnpm lint

# Exporta o Web e executa o Cypress em servidor temporário isolado
pnpm test:e2e
```

> O executor Cypress exporta o Web e sobe um servidor HTTP efêmero em `127.0.0.1:4173`; portanto, sua execução não exige usar nem disputar recursos com a prévia interativa do Metro.

## Evidência de Docker Desktop

A composição local foi validada separadamente com banco MySQL no segmento privado, API em `http://localhost:3001/api/health` e interface Web em `http://localhost:8081`. Os detalhes, limites e condições de reprodução ficam no [`VALIDATION_REPORT.md`](../../VALIDATION_REPORT.md).

## Interpretação responsável

Estes registros demonstram qualidade de engenharia e execução do protótipo. Eles **não** constituem certificação clínica, homologação com parceiros, autorização regulatória ou validação em dispositivos físicos.
