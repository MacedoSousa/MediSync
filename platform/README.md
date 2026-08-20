# MedSync

Plataforma integrada de saúde com aplicativo Expo para Android, iOS e Web, API TypeScript/tRPC e banco MySQL. O núcleo atual é um MVP protegido para paciente, responsável e cuidador, com histórico e ativos **estritamente sintéticos** no ambiente demonstrativo.

> **Limite clínico obrigatório:** o MedSync não oferece diagnóstico, triagem, prescrição, cálculo de dose, prognóstico ou decisão autônoma sobre encaminhamento. Em urgência, use o fluxo local de contingência e ligue **SAMU 192**.

## Capacidades implementadas

| Domínio | Entrega atual |
|---|---|
| Identidade | OAuth, sessão protegida, logout e retorno nativo recuperável. |
| Privacidade | Concessões por escopo e prazo, consentimento revogável e titularidade conferida no servidor. |
| Segurança | Cifragem AES-256-GCM de campos sensíveis, auditoria append-only com hash encadeado e idempotência. |
| Saúde demonstrativa | Linha do tempo, medicamentos, agenda, documentos e imagens sintéticas, sempre rotulados. |
| Agenda | Consultas confirmadas por fonte, pedido de reagendamento rastreável e adaptador demonstrativo de parceiro. |
| IA assistiva | Resumo com evidências, bloqueios determinísticos, governança, desligamento e contingência sem IA. |
| Operação | Composição Docker para MySQL, API e Web; documentação de ambiente e rotas. |

## Início rápido

Para o ambiente de desenvolvimento gerenciado, instale dependências e inicie o servidor:

```bash
pnpm install
pnpm dev
```

Execute validações antes de qualquer alteração relevante:

```bash
pnpm test
pnpm check
```

Após entrar em **Perfil**, abra **Agenda** e selecione **Preparar agenda demonstrativa**. A ação é idempotente, cria somente registros fictícios cifrados para a identidade autenticada e não representa uma consulta real.

## Execução com Docker

Há uma composição não destrutiva em [`docker/compose.yaml`](docker/compose.yaml). Copie `.env.docker.example` para `.env`, informe segredos novos e execute em uma máquina com Docker:

```bash
cp .env.docker.example .env
docker compose -f docker/compose.yaml up --build
```

Nunca reutilize a chave de desenvolvimento em produção. Consulte [`docker/README.md`](docker/README.md) e [`docs/OPERATIONS.md`](docs/OPERATIONS.md) antes de expor serviços.

## Documentação

| Documento | Conteúdo |
|---|---|
| [Arquitetura](ARCHITECTURE.md) | Decisões Clean Architecture, limites clínicos, LGPD e integrações. |
| [Backlog](BACKLOG.md) | Histórias, dependências e critérios de aceite. |
| [API](docs/API.md) | Domínios tRPC, autorização e contratos de operação. |
| [Segurança](docs/SECURITY.md) | Cifragem, auditoria, consentimento e resposta a incidentes. |
| [Operação](docs/OPERATIONS.md) | Ambientes, Docker, testes, observabilidade e recuperação. |
| [Status](docs/IMPLEMENTATION_STATUS.md) | Entregas concluídas e bloqueios externos. |
| [Matriz do protótipo](docs/PROTOTYPE_EXECUTION_MATRIX.md) | Separação entre jornadas sintéticas entregues e ativações externas bloqueadas. |
| [Aceite do protótipo](docs/PROTOTYPE_ACCEPTANCE.md) | Critérios de produto, limites de cada jornada e condição de saída para produção. |
| [Validação automatizada](docs/VALIDATION_REPORT.md) | Evidências de lint, testes, tipo, build, esquema, API local e exportação Web. |

## Licenciamento e produção

 Este repositório é uma base de engenharia. O uso de dados reais requer revisão clínica, jurídica, de privacidade, contratos com controladores e operadores, homologação de parceiros, gestão de chaves e processo de segurança independente.
