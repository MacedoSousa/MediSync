# API do MedSync

## Convenções

A API é exposta por tRPC em procedimentos públicos ou protegidos. O cliente nunca consulta o banco diretamente. Entradas são validadas com Zod, recursos sensíveis são conferidos por titularidade e mutações relevantes registram auditoria sem texto clínico livre.

| Regra | Aplicação |
|---|---|
| Sessão | Procedimentos protegidos exigem contexto de usuário autenticado. |
| Titularidade | Leitura e alteração são filtradas pelo identificador da pessoa paciente no servidor. |
| Idempotência | Operações de agenda e integrações usam chaves/correlação para impedir duplicidade. |
| Dados sintéticos | Respostas demonstrativas mantêm rótulo, fonte e proveniência explícitos. |

## Domínios disponíveis

| Namespace | Procedimentos principais | Finalidade |
|---|---|---|
| `auth` | `me`, `logout` | Consulta de sessão e encerramento seguro. |
| `legalRepresentative` | `listMine`, `request`, `verify` | Vínculo verificável de responsável legal. |
| `caregiver` | `listMine`, `grant`, `revoke` | Delegação limitada por escopo, prazo e consentimento. |
| `consent` | `listMine`, `revoke` | Transparência e revogação de consentimentos. |
| `careContact` | `listMine`, `create`, `remove` | Contatos de cuidado cifrados. |
| `audit` | `listMine` | Histórico de acesso e operações da própria pessoa. |
| `appointment` | `listMine`, `getMine`, carga demonstrativa | Agenda por fonte e dados fictícios protegidos. |
| `reschedule` | criar e listar solicitações | Pedido rastreável; não confirma consulta automaticamente. |
| `syntheticHealthAsset` | listar, detalhar e preparar demonstração | Documentos/imagens fictícios com proveniência. |
| `assistiveSummary` | gerar resumo assistivo | Saída estruturada, evidências e bloqueios de conteúdo clínico proibido. |

## Padrões de erro

| Código | Significado operacional |
|---|---|
| `UNAUTHORIZED` | Sessão ausente ou expirada; o cliente deve oferecer login recuperável. |
| `FORBIDDEN` | Papel, escopo, consentimento ou titularidade insuficiente. |
| `NOT_FOUND` | Recurso inexistente ou não pertencente à pessoa autenticada. |
| `CONFLICT` | Registro ou operação idempotente duplicada. |
| `PRECONDITION_FAILED` | Vínculo, origem, consentimento ou condição institucional não atendida. |

## Integrações externas

 O adaptador de parceiro de agenda aceita somente contratos versionados, correlacionados e idempotentes. A ativação com estabelecimento real permanece bloqueada até homologação de contrato, credenciais, finalidade, consentimento e auditoria. Não há endpoint de produção para RNDS, capacidade hospitalar, SAMU, farmácia ou operadora sem essa homologação.
