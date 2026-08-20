# MedSync — Dossiê Técnico de Portfólio

> **Posicionamento:** plataforma integrada de saúde criada como protótipo demonstrativo multiplataforma. O repositório comprova decisões de produto, arquitetura e qualidade; ele não é uma oferta de atendimento médico nem opera dados reais de pacientes.

![Infográfico de visão do produto MedSync](assets/optimized/medsync-ecosystem-infographic.jpg)

## Resumo executivo

O **MedSync** é uma plataforma de saúde digital projetada para conectar paciente, responsável legal e cuidador a informações de saúde autorizadas, agenda, rotina de medicamentos, alertas explicáveis e contingência de emergência. O núcleo compartilha regras entre **Android, iOS e Web**, utilizando Expo/React Native no cliente, TypeScript/tRPC na API e MySQL com Drizzle ORM na persistência.

O desafio não era apenas reunir telas em um aplicativo. O objetivo de engenharia foi criar uma base demonstrável que tratasse informações de saúde como dados sensíveis, limitasse claramente o papel da IA e impedisse que cenários ainda sem fonte contratada fossem apresentados como fatos. O resultado é um protótipo funcional, documentado e validado automaticamente, preparado para evoluir com integrações institucionais sob homologação.

| Eixo | Entrega de portfólio |
|---|---|
| Produto | Jornadas demonstrativas para paciente, responsável, cuidador e perfis institucionais segregados. |
| Engenharia | Clean Architecture pragmática, contratos tipados, tRPC, MySQL/Drizzle e Docker local. |
| Privacidade | Consentimento revogável, menor privilégio, cifragem AES-256-GCM e auditoria encadeada. |
| Segurança clínica | IA assistiva limitada, sem diagnóstico, triagem, dose, prescrição ou decisão autônoma. |
| Qualidade | 105 testes de regressão, checagem TypeScript, lint, Cypress Web e evidências operacionais. |

## O problema e a proposta

Pessoas em cuidado contínuo frequentemente precisam organizar consultas, documentos, medicamentos e a comunicação com sua rede de apoio. Ao mesmo tempo, clínicas, farmácias, operadoras e regulação dependem de dados confiáveis, proveniência, autorização e processos institucionais. Uma plataforma que ignore essas fronteiras pode vazar dados, induzir decisões clínicas incorretas ou prometer integrações inexistentes.

O MedSync responde a esse cenário com uma proposta deliberadamente gradual. No ambiente de demonstração, as jornadas usam somente dados sintéticos e são marcadas visualmente como tal. Recursos que dependem de hospitais, farmácias, profissionais, operadoras, RNDS ou regulação aparecem como módulos de demonstração bloqueados para qualquer ação real. Essa escolha reduz risco de produto e mantém o backlog tecnicamente honesto.

## Experiência do produto

O protótipo entrega uma navegação responsiva, voltada a uso em tela compacta e também disponível no Web. A interface apresenta acesso a linha do tempo, documentos sintéticos, plano de medicamentos, confirmação de tomada, agenda, pedido de reagendamento, contatos de cuidado, auditoria e central de transparência da IA.

![Evidência da interface inicial em viewport compacto](evidence/cypress/medsync-web.cy.ts/web-home-mobile.png)

| Jornada | O que a demonstração comprova | Proteção aplicada |
|---|---|---|
| Perfil e privacidade | Preferências, contatos e transparência de dados. | Sessão protegida, vínculo e propósito de acesso. |
| Linha do tempo e acervo | Registros, imagens e documentos estritamente sintéticos. | Proveniência, rótulo de demonstração e campos protegidos. |
| Medicamentos | Plano, lembretes e registro de tomada. | Não calcula dose nem substitui orientação profissional. |
| Agenda | Consultas por fonte identificada e reagendamento rastreável. | Solicitação não é confirmação; integrações reais permanecem bloqueadas. |
| IA assistiva | Resumo estruturado, evidências, limites e desligamento. | Sem triagem, diagnóstico, prescrição ou decisão de encaminhamento. |
| Emergência | Acesso determinístico ao SAMU 192 e contatos autorizados. | Independe de IA, crédito, modelo ou conectividade. |

## Arquitetura e decisões técnicas

![Infográfico de arquitetura limpa e segurança](assets/optimized/medsync-architecture-infographic.jpg)

O projeto adota um **monólito modular** como decisão consciente de estágio. Em vez de antecipar microserviços, o núcleo concentra a aplicação em módulos com contratos estáveis, diminuindo custo de operação e inconsistências transacionais enquanto as integrações externas ainda são demonstrativas. A separação é mantida por responsabilidades: telas e adaptadores de apresentação, casos de uso, políticas de domínio e infraestrutura.

```text
Expo / React Native (Android · iOS · Web)
                  │
              tRPC / Express
                  │
      Casos de uso e políticas de domínio
                  │
      Drizzle ORM / MySQL / auditoria encadeada
                  │
 Adaptadores futuros: RNDS/FHIR, agenda, farmácia, operadora
```

| Decisão | Motivo | Evidência no repositório |
|---|---|---|
| Expo + React Native | Um núcleo de interface para Android, iOS e Web. | `app/`, `app.config.ts` e contratos de paridade móvel. |
| TypeScript end-to-end | Reduzir divergência entre rotas, dados e telas. | `shared/`, `server/`, `pnpm check`. |
| tRPC + Express | Contratos tipados sem duplicar DTOs de transporte. | `server/routers.ts` e `lib/trpc.ts`. |
| MySQL + Drizzle | Migrações versionadas e tipagem da persistência. | `drizzle/schema.ts` e `drizzle/`. |
| Clean Architecture pragmática | Regras de saúde e autorização isoladas de frameworks. | `ARCHITECTURE.md`, `shared/` e testes de políticas. |
| Docker local | Reproduzir banco, API e interface para validação. | `docker/compose.yaml` e relatório de operação. |

## Segurança, privacidade e limites clínicos

Dados de saúde são dados pessoais sensíveis. Por isso, o protótipo adota autorização por papel e atributos, concessões por escopo e tempo, revogação de consentimento, identificadores não sequenciais, auditoria append-only com hash encadeado e cifragem de campos sensíveis com AES-256-GCM. A aplicação não registra conteúdo clínico livre em logs de auditoria e mantém os dados demonstrativos explícitos para impedir confusão com prontuários reais.

> **Princípio de segurança clínica:** a IA organiza contexto autorizado e retorna informações estruturadas para revisão. Ela não diagnostica, tria, prescreve, modifica dose, escolhe hospital ou aciona serviços de emergência autonomamente.

![Infográfico de segurança e IA assistiva](assets/optimized/medsync-safety-infographic.jpg)

| Controle | Como foi implementado no protótipo | Condição para uso real |
|---|---|---|
| Identidade e sessão | OAuth, sessão protegida e logout recuperável. | Política de identidade reforçada e gestão de dispositivos. |
| Consentimento | Escopo, propósito, prazo e revogação auditável. | Revisão jurídica, termos aprovados e governança operacional. |
| Cifragem | AES-256-GCM para campos sensíveis em repouso. | KMS/cofre de chaves, rotação e segregação por ambiente. |
| Auditoria | Eventos encadeados, ator, alvo, finalidade e correlação. | Imutabilidade de infraestrutura/WORM e retenção aprovada. |
| IA | Regras versionadas, revisão humana, transparência e desligamento. | Avaliação clínica, regulatória e monitoramento contínuo. |
| Emergência | Fluxo local para SAMU 192 e contatos autorizados. | Integração oficial somente com governança e decisão humana. |

As decisões seguem a natureza especial dos dados de saúde na LGPD e preservam a decisão médica humana no uso relevante de IA. A integração com a RNDS foi modelada como fronteira institucional, não como simples chamada técnica. [1] [2] [3]

## Qualidade, testes e provas de execução

O projeto foi desenvolvido com testes de regras de domínio, contrato e regressão. Além da validação estática e do lint, o Web possui uma suíte Cypress que exporta o aplicativo de forma estática e testa uma instância isolada. Essa estratégia evita que o navegador de automação concorra por recursos com a prévia Expo/Metro durante a execução.

| Verificação | Resultado documentado | Como reproduzir |
|---|---:|---|
| Regressão de domínio | 43 arquivos / 105 testes aprovados | `pnpm test` |
| Tipagem | Aprovada sem erros | `pnpm check` |
| Lint | Aprovado | `pnpm lint` |
| E2E Web | 4 cenários Cypress aprovados | `pnpm test:e2e` |
| Exportação Web | Rotas estáticas geradas | `pnpm exec expo export --platform web` |
| Docker local | MySQL, API e Web aprovados em Windows | `docker compose -f docker/compose.yaml up --build` |

![Evidência do explorador demonstrativo em desktop](evidence/cypress/medsync-web.cy.ts/web-care-explorer-desktop.png)

As evidências não são apresentadas como certificação de produção. O relatório registra de forma explícita o que foi validado e o que ainda depende de dispositivos físicos, homologação de parceiros, análise jurídica, validação clínica e fonte institucional. Consulte as [provas de execução](evidence/EXECUTION_EVIDENCE.md), [`VALIDATION_REPORT.md`](../VALIDATION_REPORT.md), [`CYPRESS.md`](../CYPRESS.md) e a [matriz de execução do protótipo](../PROTOTYPE_EXECUTION_MATRIX.md).

## Operação e reprodução local

```bash
# Desenvolvimento
pnpm install
pnpm dev

# Qualidade
pnpm test
pnpm check
pnpm lint
pnpm test:e2e

# Docker local — após configurar segredos novos em .env
docker compose -f docker/compose.yaml up --build
```

No Docker Desktop de demonstração, a composição foi validada com MySQL no segmento privado, API em `http://localhost:3001/api/health` e Web em `http://localhost:8081`. O contexto de build exclui `.env`, logs, artefatos e dependências locais, evitando que segredos e binários específicos do sistema hospedeiro sejam enviados à imagem Linux.

## Escopo, maturidade e próximos passos honestos

O MedSync é uma demonstração de engenharia e produto. Ele implementa as jornadas internas possíveis sem parceiros reais, mas não afirma disponibilidade de médico, estoque de medicamento, preço, cobertura, autenticidade de receita, lotação ou rota de emergência. Produção com dados reais requer homologação, contratos, revisão de segurança e privacidade, processo de resposta a incidentes, testes em dispositivos e validação clínica e regulatória apropriada.

Para um contexto profissional, este repositório demonstra capacidade de transformar um domínio de alta responsabilidade em um produto rastreável: requisitos claros, decisões arquiteturais, limites explícitos, testes automatizados, documentação operacional e uma estratégia de evolução que não confunde protótipo com serviço clínico.

## Índice de evidências visuais

| Artefato | Finalidade |
|---|---|
| `assets/optimized/medsync-ecosystem-infographic.jpg` | Visão integrada dos participantes e módulos do produto. |
| `assets/optimized/medsync-architecture-infographic.jpg` | Camadas, fluxo de dados e fronteiras de integração. |
| `assets/optimized/medsync-safety-infographic.jpg` | Privacidade, auditoria, IA assistiva e contingência. |
| `evidence/cypress/medsync-web.cy.ts/web-home-mobile.png` | Interface inicial em viewport móvel, capturada em execução Cypress. |
| `evidence/cypress/medsync-web.cy.ts/web-care-explorer-desktop.png` | Explorador demonstrativo em desktop, capturado em execução Cypress. |
| [`evidence/EXECUTION_EVIDENCE.md`](evidence/EXECUTION_EVIDENCE.md) | Comandos reproduzíveis e resultados de execução. |
| [`assets/optimized/medsync-presentation-preview.mp4`](assets/optimized/medsync-presentation-preview.mp4) | Prévia versionável do vídeo; o original 1280 × 720 permanece nos arquivos persistentes do projeto. |

## Referências

[1] [Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[2] [Conselho Federal de Medicina — normatização do uso de IA na medicina](https://portal.cfm.org.br/noticias/cfm-normatiza-uso-da-ia-na-medicina/)

[3] [Ministério da Saúde — Rede Nacional de Dados em Saúde](https://rnds.saude.gov.br/)
