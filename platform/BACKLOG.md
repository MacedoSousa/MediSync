# Backlog Mestre do MedSync

## Regra de execução

Este documento é a referência única de prioridade do MedSync. A execução seguirá a coluna **Ordem** de forma sequencial: uma história não entra em desenvolvimento até que a anterior esteja concluída ou bloqueada formalmente pelo PO, pelo responsável clínico e por segurança/DBA. Em caso de bloqueio externo, será iniciada somente a próxima história que não quebre uma dependência de segurança, privacidade ou rastreabilidade.

As estimativas representam esforço de desenvolvimento para uma equipe dedicada e não são promessa de data. Integrações com instituições, farmácias, operadoras, RNDS ou operações de emergência dependem de contrato, homologação e fonte operacional validada.

| Prioridade | Significado | Regra |
|---|---|---|
| P0 | Bloqueador para um MVP seguro e útil | Não pode haver funcionalidade clínica, compartilhamento ou integração acima dela sem sua conclusão. |
| P1 | Importante após o núcleo seguro | Entra depois dos fluxos P0 validados e de um piloto de dados sintéticos ou parceiro autorizado. |
| P2 | Expansão institucional ou de escala | Depende de aprendizado do piloto, contratos e governança adicional. |
| P3 | Otimização futura | Não entra antes de métricas reais demonstrarem necessidade. |

## Épicos e ordem macro

| Ordem macro | Épico | Objetivo de negócio | Prioridade | Resultado mensurável |
|---:|---|---|---|---|
| 0 | Fundação de engenharia e governança | Criar base segura, testável e auditável | P0 | CI local, regras de domínio, dados sintéticos e Definition of Done aplicáveis. |
| 1 | Identidade, privacidade e auditoria | Garantir acesso único, menor privilégio e consentimento | P0 | Nenhuma leitura clínica sem identidade, autorização e evento de auditoria. |
| 2 | Perfil e histórico de saúde | Dar ao paciente uma visão rastreável das próprias informações | P0 | Toda informação mostra origem, data e estado de atualização. |
| 3 | Medicamentos e cuidado compartilhado | Apoiar a rotina sem interferir em prescrição ou dispensação | P0 | Confirmações rastreáveis; cuidador vê apenas o escopo concedido. |
| 4 | Agenda e reagendamento | Organizar atendimento e reduzir incerteza do paciente | P0 | Solicitação e confirmação são estados distintos e verificáveis. |
| 5 | Agente de IA assistivo | Organizar informações autorizadas sem decisão clínica autônoma | P1 | Resposta estruturada, evidenciada, limitada e auditada. |
| 6 | Farmácias e medicamentos parceiros | Tornar busca de preço/estoque útil e segura | P1 | Oferta com fonte, atualização e validação humana farmacêutica preservada. |
| 7 | Portal Web para clínicas e hospitais | Viabilizar operação institucional e integração de agenda | P1 | Painel multi-organização com acesso segregado e auditoria. |
| 8 | Operadoras | Exibir cobertura de fontes autorizadas sem seleção de risco | P2 | Resposta de cobertura com fonte e dados mínimos. |
| 9 | Regulação, SAMU e capacidade hospitalar | Apoiar operação com sinais validados, sem decisão autônoma | P2 | Dados operacionais atualizados, SLA e decisão humana registrada. |
| 10 | iOS e escala | Levar o núcleo validado a iOS e preparar crescimento | P2 | Paridade funcional do núcleo, testes e observabilidade de produção. |

## P0 — Fundação, identidade, privacidade e auditoria

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 1 | US-001 | Como plataforma, quero uma base de qualidade e dados sintéticos para que recursos de saúde sejam desenvolvidos sem expor dados reais. | Criar factories de dados sintéticos; configurar convenções de teste; criar matriz de rastreabilidade US→teste; bloquear dados sensíveis em logs; documentar revisão clínica. | Testes executam no projeto; nenhum fixture contém dado pessoal real; cada nova US exige teste e critério de aceite. | Fundação atual. | 2–3 dias |
| 2 | US-002 | Como paciente, quero criar e acessar uma conta individual para que meus dados não sejam compartilhados por credenciais coletivas. | Integrar autenticação; modelar conta, perfil e sessão; armazenar token em repositório seguro; tratar expiração e logout; registrar eventos de autenticação. | Não há acesso anônimo a dados pessoais; logout invalida sessão local; erro não revela se um dado sensível existe. | US-001; provedor de identidade e termos aprovados. | 3–5 dias |
| 3 | US-003 | Como responsável legal, quero vincular-me a um paciente sob minha responsabilidade para administrar o acesso permitido. | Modelar relação paciente–responsável; fluxo de convite/aceite; validar documentação ou processo institucional; criar vigência e revogação. | A relação possui estado, origem, criador e data; responsável não é automaticamente cuidador; toda alteração fica auditada. | US-002; regra jurídica e clínica aprovada. | 3–4 dias |
| 4 | US-004 | Como paciente, quero conceder acesso mínimo a um cuidador por uma finalidade e prazo definidos. | Persistir concessões por escopo; criar tela de concessão, revisão e revogação; aplicar política ABAC em cada rota; testar acesso positivo e negativo. | Cuidador só acessa escopo ativo; revogação impede nova leitura imediatamente; escopo de medicamento não libera histórico completo. | US-002; política de acesso existente. | 3–5 dias |
| 5 | US-005 | Como paciente, quero consultar e revogar meus consentimentos para manter controle sobre o uso dos meus dados. | Modelar finalidade, versão de termo, consentimento e revogação; apresentar linha do tempo de consentimentos; criar exportação controlada; manter prova de aceite. | Cada consentimento exibe finalidade, escopo e termo; revogação é prospectiva e auditada; o sistema informa efeitos da revogação. | US-002 a US-004; termos e encarregado de dados definidos. | 4–5 dias |
| 6 | US-006 | Como paciente, quero saber quem acessou meus dados e por qual motivo. | Criar evento append-only; adicionar ator, alvo, organização, finalidade, resultado e correlação; implementar verificação de integridade; criar consulta paginada. | Toda rota clínica cria evento; eventos não podem ser editados pela aplicação; tela mostra data, ator, finalidade e resultado. | US-002; infraestrutura de persistência. | 4–6 dias |
| 7 | US-007 | Como administrador de segurança, quero detectar e registrar tentativas de acesso indevido para investigar incidentes. | Criar eventos de negação; limitar tentativas; estruturar logs sem conteúdo clínico; criar runbook de incidente; testar cenários de acesso negado. | Tentativas negadas são auditadas sem vazar dado; alertas técnicos possuem correlação; runbook é revisado. | US-006. | 2–3 dias |

## P0 — Perfil, histórico e proveniência

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 8 | US-008 | Como paciente, quero manter meu perfil e contatos de cuidado para tornar a jornada pessoal compreensível. | Modelar perfil, preferências de acessibilidade e contatos; validar campos; criar edição protegida; registrar alterações. | Campos possuem validação; contatos não ganham acesso automaticamente; alteração aparece na auditoria. | US-002 e US-006. | 2–3 dias |
| 9 | US-009 | Como paciente, quero ver uma linha do tempo de saúde com origem e atualização de cada item. | Criar entidade de registro e proveniência; criar repositório; implementar lista paginada e estado vazio; testar ordenação e autorização. | Todo registro tem origem, data, tipo e status; ausência de fonte não é apresentada como registro confirmado. | US-004 a US-006. | 4–5 dias |
| 10 | US-010 | Como paciente, quero ler o detalhe de um registro sem perder a origem do conteúdo. | Criar detalhe de evento; associar fonte, autor/instituição e anexos; proteger acesso; criar estados de indisponibilidade. | Detalhe mantém proveniência; item sem permissão não é retornado; anexos não são expostos por URL pública. | US-009; armazenamento protegido. | 3–4 dias |
| 11 | US-011 | Como time de produto, quero inserir dados de demonstração claramente rotulados para validar a experiência sem simular informação real. | Criar fixtures não clínicos; selo de demonstração; feature flag de ambiente; testes para impedir mistura com produção. | Todo dado de demonstração é identificável; produção não usa fixtures; tela informa origem de demonstração. | US-009. | 2 dias |
| 12 | US-012 | Como integrador, quero preparar um contrato de importação com proveniência para receber uma fonte piloto autorizada. | Definir `ClinicalRecordGateway`; criar DTO/validador; idempotência por emissor; mapeamento inicial FHIR; testes de contrato. | Reimportação não duplica eventos; falhas são rastreáveis; campo externo é preservado com emissor e referência. | US-009 e US-010; parceiro piloto/homologação. | 4–6 dias |

## P0 — Medicamentos, cuidador e alertas de rotina

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 13 | US-013 | Como paciente, quero registrar um plano de medicamento com fonte e instruções para organizar minha rotina. | Modelar plano, prescrição de referência e fonte; validar entrada; criar lista e detalhe; proteger escopos. | Nenhum campo recalcula dose; a origem da instrução aparece; medicamento inativo não gera novo lembrete. | US-009; revisão clínica de conteúdo. | 4–5 dias |
| 14 | US-014 | Como paciente ou cuidador autorizado, quero registrar se uma tomada ocorreu para acompanhar a rotina. | Modelar registro de tomada; capturar ator/data/hora; garantir idempotência; criar fluxo de confirmação e correção auditada. | Registro não altera prescrição; confirmações duplicadas são tratadas; correção mantém histórico anterior. | US-004, US-006 e US-013. | 3–4 dias |
| 15 | US-015 | Como paciente, quero receber lembretes discretos da minha rotina sem expor informações na tela bloqueada sem minha escolha. | Implementar preferências de notificação; agendar lembrete local; usar conteúdo neutro por padrão; criar opt-in de conteúdo protegido. | Notificação padrão não mostra nome/dose; preferência é revogável; o sistema registra falha de agendamento. | US-013 e US-014; aprovação de conteúdo. | 3–5 dias |
| 16 | US-016 | Como cuidador, quero acessar somente a rotina de medicamentos concedida para ajudar sem invadir a privacidade do paciente. | Aplicar escopo de medicamentos nas telas/rotas; criar visualização de rotina delegada; testar bloqueio de outros registros; auditar consulta. | Cuidador não abre timeline ou documentos sem escopo; todas as leituras são auditadas; paciente pode revogar em tempo real. | US-004, US-006 e US-013. | 3–4 dias |
| 17 | US-017 | Como paciente, quero ver alertas de rotina explicáveis para saber o que preciso conferir. | Criar regra versionada; modelar evidência; criar central de alertas; bloquear texto diagnóstico/terapêutico; testar contrato de texto seguro. | Alerta mostra regra, evidência, data e ação segura; não recomenda dose, diagnóstico ou encaminhamento autônomo. | US-013 a US-016; aprovação clínica. | 4–6 dias |

## P0 — Agenda e reagendamento

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 18 | US-018 | Como paciente, quero visualizar consultas confirmadas com origem e instruções para me preparar adequadamente. | Modelar consulta, status e fonte; criar agenda/lista/detalhe; criar estado vazio; validar fuso e horário. | Exibe somente confirmação recebida de fonte identificada; data/hora/local estão claros; cancelamento possui status distinto. | US-009; fonte piloto ou dados sintéticos. | 3–4 dias |
| 19 | US-019 | Como paciente, quero solicitar reagendamento e acompanhar o retorno do estabelecimento. | Modelar solicitação e transições; validar idempotência; criar tela de envio/status; notificar atualização; auditar ações. | Solicitar não cria consulta confirmada; estado mostra origem e data; usuário não envia o mesmo pedido em duplicidade. | US-018; parceiro de agenda. | 4–5 dias |
| 20 | US-020 | Como estabelecimento parceiro, quero atualizar o estado de uma solicitação de forma segura. | Criar adaptador de agenda; contrato de webhook/polling; autenticar parceiro; criar conciliação e logs de falha. | Atualização tem emissor e correlação; dados inválidos são rejeitados; reprocessamento é idempotente. | US-019; contrato/homologação do parceiro. | 5–8 dias |

## P1 — Agente de IA assistivo

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 21 | US-021 | Como paciente, quero receber um resumo organizado dos meus registros autorizados para encontrar informações com mais facilidade. | Definir contrato de saída estruturada; minimizar contexto; implementar serviço de sumarização; associar evidências; criar avaliação com casos sintéticos. | Resposta indica que é assistiva; cada ponto aponta para registro de origem; não contém diagnóstico, prognóstico ou dose. | US-009 a US-012; governança de IA aprovada. | 5–7 dias |
| 22 | US-022 | Como responsável clínico, quero revisar regras e respostas do agente antes de ampliar seu uso. | Criar catálogo de regras/versões; painel de avaliação; fila de revisão; métricas de bloqueio e feedback; procedimento de desligamento. | Regra possui responsável e versão; resposta insegura é bloqueada; métricas permitem auditoria e desligamento. | US-021; responsável clínico e processo de governança. | 4–6 dias |
| 23 | US-023 | Como paciente, quero saber quando a IA foi usada e quais são seus limites. | Criar aviso contextual; armazenar consentimento/avisos; exibir fonte e limitação no resultado; registrar execução. | O usuário vê uso relevante de IA; execução fica auditada; não há resposta sem fontes e limites. | US-021 e US-006. | 2–3 dias |

## P1 — Farmácias, portal Web e instituições

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 24 | US-024 | Como paciente, quero pesquisar medicamento em parceiros e ver preço/estoque com data de atualização. | Definir `MedicationAvailabilityGateway`; criar catálogo e filtros; exibir parceiro/data; validar cache e indisponibilidade. | Oferta mostra fonte e data; estoque/preço não é prometido como garantia; estado indisponível é explícito. | Parceiros e contrato de dados. | 5–8 dias |
| 25 | US-025 | Como farmacêutico, quero verificar o estado de uma receita digital por fonte autorizada. | Definir contrato de verificação; autenticar estabelecimento; registrar consulta; criar resposta de estado sem decisão automatizada. | Sistema não substitui validação farmacêutica; resultado tem origem/validade; tentativas são auditadas. | US-024; revisão regulatória e parceiro autorizado. | 6–10 dias |
| 26 | US-026 | Como operador de clínica/hospital, quero entrar em um portal Web segregado por organização. | Criar portal Web; modelar organização/vínculo; aplicar ABAC; criar tela de membros; testes de isolamento de tenant. | Usuário não vê dados de outra organização; toda ação é auditada; permissão é mínima por função. | US-002, US-006; modelo organizacional aprovado. | 6–8 dias |
| 27 | US-027 | Como equipe de agenda, quero gerenciar solicitações de pacientes no portal. | Criar fila, filtro e detalhe; atualizar status; integrar US-020; registrar decisões e justificativas. | Transição segue estados válidos; paciente recebe atualização; operador não acessa dados fora da finalidade. | US-020 e US-026. | 5–7 dias |

## P2 — Operadoras, SAMU, hospitais, iOS e escala

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 28 | US-028 | Como paciente, quero consultar informações de cobertura de fonte autorizada para me orientar antes do atendimento. | Definir `CoverageGateway`; criar resposta de cobertura com origem; aplicar minimização de dados; criar testes de finalidade. | A resposta não permite seleção de risco; exibe fonte e atualização; informação não é apresentada como garantia de cobertura. | Contrato com operadora, parecer jurídico e governança de dados. | 6–10 dias |
| 29 | US-029 | Como regulador, quero consultar sinais validados de capacidade e especialidade para apoiar a decisão humana de destino. | Definir `CapacitySignalGateway`; exigir atualização/SLA; criar painel de fontes; registrar decisão humana; criar alertas de dado obsoleto. | Não existe recomendação autônoma de hospital; fonte desatualizada é destacada; decisão humana fica registrada. | Acordos institucionais, governança pública e dados operacionais. | 10–15 dias |
| 30 | US-030 | Como paciente iOS, quero usar as mesmas funções nucleares com segurança e acessibilidade. | Validar paridade Expo/iOS; configurar permissões; testar segurança de armazenamento e notificações; executar testes em dispositivo. | Núcleo de P0 preserva fluxos e critérios; comportamento específico de iOS é documentado e testado. | P0 concluído e piloto Android estável. | 5–8 dias |
| 31 | US-031 | Como operação, quero monitorar disponibilidade, falhas de integração e segurança para responder a incidentes. | Criar métricas, traces e alertas; separar logs clínicos; criar SLOs; testar backup/restauração; realizar exercício de incidente. | Painel não exibe conteúdo clínico; incidentes têm correlação e responsável; recuperação é testada. | US-006, integrações e ambiente de produção. | 5–8 dias |

## P1 e P2 — Acessos, descoberta e serviços conectados

| Ordem | ID | História de usuário | Tarefas técnicas | Critérios de aceite | Dependências | Esforço |
|---:|---|---|---|---|---|---:|
| 32 | US-032 | Como usuário ou organização, quero ver somente a experiência e os dados compatíveis com meu papel para operar a plataforma com privacidade. | Modelar vínculo organizacional, papel, escopo, vigência e finalidade; separar grupos de rotas; aplicar RBAC + ABAC no servidor; criar isolamento de tenant e auditoria negativa. | Paciente, responsável, cuidador, profissional, clínica, farmácia, operadora, regulação e administração recebem menus e dados mínimos; alteração de vínculo é auditada; acesso cruzado falha. | US-002, US-005, US-006; modelo organizacional aprovado. | 6–9 dias |
| 33 | US-033 | Como paciente, quero buscar médicos, especialidades, clínicas e hospitais com filtros para escolher uma fonte de atendimento informada. | Definir `ServiceDirectoryGateway`; modelar emissor, atualização, modalidade, especialidade, acessibilidade, SUS e convênio declarado; criar busca, filtros, paginação e estado sem fonte. | Todo resultado mostra fonte, atualização e natureza declarada; ausência de fonte é explícita; nenhum filtro promete cobertura, vaga ou elegibilidade. | US-032; diretório ou parceiro autorizado. | 6–10 dias |
| 34 | US-034 | Como paciente, quero sair da busca para solicitar uma consulta, consultar detalhes e acessar orientação de deslocamento de fonte conhecida. | Vincular diretório, agenda e detalhes; criar `FacilityRouteGateway`; abrir link institucional ou mapa autorizado; registrar origem e correlação; tratar indisponibilidade. | Solicitação e consulta confirmada continuam distintos; link de rota não escolhe destino de emergência; horários, convênios e localização exibem fonte e data. | US-018 a US-020, US-033; fonte cartográfica e parceiro de agenda. | 5–8 dias |
| 35 | US-035 | Como paciente, quero iniciar telemedicina ou contato direto quando o estabelecimento parceiro declarar essa opção disponível. | Definir `TelehealthGateway`; validar vínculo, modalidade, disponibilidade, consentimento e expiração; criar entrada segura e retorno de indisponibilidade; auditar metadados mínimos. | Não há teleconsulta sem parceiro e termos aplicáveis; dados clínicos e mídia não entram em logs; indisponibilidade apresenta canal institucional e contingência segura. | US-032, US-034; parceiro habilitado, revisão jurídica e clínica. | 8–13 dias |
| 36 | US-036 | Como paciente, quero comparar promoções, preços, estoque e vigência de medicamentos publicados por farmácias parceiras. | Estender `MedicationAvailabilityGateway`; modelar oferta, vigência, atualização e elegibilidade comercial; criar filtros de distância e parceiro; bloquear personalização por dado clínico. | Oferta mostra farmácia, data, validade e condições; preço/estoque não são garantidos; sem parceiro, dados demonstrativos continuam rotulados. | US-024; farmácias homologadas e política comercial aprovada. | 5–8 dias |
| 37 | US-037 | Como paciente, quero receber alertas de vigência e datas para não perder informações e ações que dependem de prazo. | Criar regras de vencimento para consentimentos, agendamentos, benefícios, documentos autorizados e receitas verificadas; configurar preferências, fuso, escalonamento e confirmação de leitura. | Alerta exibe fonte, prazo e ação não clínica; nenhuma receita é renovada nem medicamento é alterado automaticamente; preferências são revogáveis e auditadas. | US-005, US-015, US-018, US-025 e US-036. | 4–6 dias |
| 38 | US-038 | Como usuário, quero que a IA assistiva permaneça acessível de forma segura e previsível, com contingência caso esteja indisponível. | Definir SLO, monitoramento, fila limitada, resposta degradada, desligamento, orçamento técnico, status de disponibilidade e testes de falha; manter fluxo local de emergência independente. | IA nunca bloqueia contatos de emergência, agenda ou acesso a dados; indisponibilidade não produz conteúdo clínico inventado; estado e correlação são auditáveis. | US-021 a US-023, US-031; governança clínica e capacidade operacional. | 5–8 dias |

## Tarefas transversais obrigatórias

| ID | Tarefa | Quando executar | Critério de conclusão |
|---|---|---|---|
| TT-01 | TDD e testes de regressão | Em cada US | Testes unitários, integração/contrato quando aplicável e reprodução de defeitos corrigidos. |
| TT-02 | Revisão clínica | Antes de US com medicamento, alertas, IA ou conteúdo assistencial | Responsável clínico aprova textos, regras e cenários de risco. |
| TT-03 | Revisão de privacidade e DBA | Antes de US com dados sensíveis, novos campos ou integração | Base legal/finalidade, acesso mínimo, esquema, índices, retenção e auditoria validados. |
| TT-04 | Acessibilidade | Em cada tela | Leitor de tela, contraste, tamanho de fonte e foco validados. |
| TT-05 | Segurança de integração | Antes de qualquer parceiro | Contrato, autenticação, rotação de segredo, idempotência, timeout, retentativa e observabilidade validados. |
| TT-06 | Validação do PO | Antes de mover para pronto para liberar | Critérios de aceite testados com cenário de usuário e evidência anexada. |

## Critérios de entrada e saída

Uma US entra em desenvolvimento somente se o problema, ator, escopo, dados, dependências, riscos, critérios de aceite e teste mínimo estiverem definidos. Ela só sai para homologação após passar em testes, tipos, lint, análise clínica/privacidade aplicável e revisão de código. O PO só a aceita quando o fluxo de ponta a ponta, estados vazios/erro, acessibilidade e evidências de auditoria forem demonstrados.

## Próxima execução

Com a fundação e as histórias internas US-001 a US-023, US-030 e US-031 concluídas, a próxima implementação interna prioritária é **US-032 — Matriz de acesso segregada e isolamento organizacional**. Ela precede qualquer portal, diretório ou telemedicina, porque impede exposição cruzada de organizações e permite que as integrações posteriores recebam somente o escopo necessário. As histórias US-033 a US-038 só conectam dados reais após as homologações indicadas em suas dependências.

## Referências

[1] [Conselho Federal de Medicina — CFM normatiza uso da IA na medicina](https://portal.cfm.org.br/noticias/cfm-normatiza-uso-da-ia-na-medicina/)

[2] [Lei nº 13.709/2018 — LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm)
