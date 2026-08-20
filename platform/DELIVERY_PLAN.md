# Plano de Entrega, Kanban e Critérios de Aceite — MedSync

## Objetivo de produto e princípio de entrega

O MedSync deve reduzir a fragmentação da jornada de cuidado sem assumir decisões clínicas que pertencem a profissionais e serviços regulados. A primeira entrega comercializável é um aplicativo Android seguro para paciente, responsável e cuidador, que organiza informações autorizadas, medicamentos, agenda e permissões. O portal Web, as integrações de clínicas e hospitais, farmácias, operadoras e os recursos de emergência devem ser acrescentados somente após integrações auditáveis, homologadas e com origem operacional verificável.

> **Regra de liberação:** nenhum recurso será considerado pronto apenas porque a tela funciona. Em saúde, “pronto” requer regra de negócio testada, segurança revisada, acessibilidade, proveniência dos dados, auditabilidade e validação do responsável clínico quando houver impacto assistencial.

## Quadro Kanban inicial

| Coluna | Cartões | Critério para mover o cartão |
|---|---|---|
| Descoberta | Mapeamento da rede local, requisitos de parceiros, modelos FHIR/RNDS, análise regulatória | Problema, usuário, dado necessário, risco e métrica definidos pelo PO e governança clínica |
| Pronto para desenvolvimento | História refinada, protótipo, regra de aceitação, ameaças e contrato de integração | Design, segurança, dados e dependências revisados; sem dúvida crítica em aberto |
| Em desenvolvimento | Implementação vertical com teste primeiro | Pull request com testes unitários e de integração pertinentes; sem segredo ou dado real no código |
| Revisão clínica e de segurança | Fluxos de medicamentos, alertas, acesso, consentimento e conteúdo em análise | Cenário de risco aprovado pelo clínico e evidência de controle revisada por segurança/DBA |
| Homologação | Fluxo completo no ambiente de homologação, com dados sintéticos | Critérios de aceite aprovados por PO, QA e representante de usuário |
| Pronto para liberar | Versão rastreável e plano de reversão | Observabilidade, suporte, documentação, release notes e decisão de go/no-go registrados |
| Pós-lançamento | Métricas, incidentes, solicitações e hipóteses de melhoria | Item classificado, priorizado e convertido em aprendizagem ou cartão futuro |

## Roadmap por ondas

As estimativas abaixo são referências de planejamento para um time dedicado e podem variar conforme a homologação dos parceiros e decisões regulatórias. Integrações institucionais são tratadas como marcos de risco, não como simples tarefas de desenvolvimento.

| Onda | Duração indicativa | Resultado verificável | Responsáveis principais | Dependência de negócio |
|---|---:|---|---|---|
| 0. Fundamentos | Concluída | Arquitetura, escopo MVP, política de acesso testada, design Android e identidade visual | PO, Tech Lead, Clínico, Segurança/DBA, Mobile | Definir governança e responsável técnico |
| 1. Identidade e privacidade | 2 semanas | Conta, sessão segura, perfis, consentimento, delegação de cuidador e auditoria de acesso | Backend, Mobile, Segurança/DBA, QA | Provedor de identidade e termos aprovados |
| 2. Minha saúde | 2 semanas | Linha do tempo, proveniência, documentos e estados sem dados reais | Mobile, Backend, QA, Clínico | Modelo de dados e fonte piloto definidos |
| 3. Medicamentos e cuidado compartilhado | 3 semanas | Rotina, lembretes, confirmação de tomada, permissões de cuidador e alertas versionados | Mobile, Backend, Clínico, QA | Revisão clínica das regras e conteúdo |
| 4. Agenda e reagendamento | 2 semanas | Solicitação rastreável, status e confirmação vinda do estabelecimento | Integrações, Backend, Mobile, QA | Parceiro clínico/hospitalar homologado |
| 5. Agente assistivo controlado | 2 semanas | Resumo estruturado com evidências, limites, auditoria e supervisão humana | IA, Backend, Clínico, Segurança, QA | DPIA/RIPD aplicável e regras de uso aprovadas |
| 6. Piloto controlado | 3 semanas | Telemetria, suporte, treinamento, testes de acessibilidade e correções de regressão | PO, QA, Suporte, Clínico, Segurança | Grupo piloto, canal de suporte e plano de incidentes |
| 7. Expansão Web e parceiros | Planejamento após piloto | Portal de instituições e conectores por parceiro, um de cada vez | Fullstack, Integrações, DBA, QA | Métricas do piloto e contratos assinados |

## Backlog priorizado do MVP

| Prioridade | História de usuário | Critérios de aceite essenciais | Indicador de sucesso |
|---|---|---|---|
| P0 | Como paciente, quero saber quais informações o MedSync tem sobre mim e de onde vieram. | Cada item mostra data, fonte, tipo e status; ausência de conexão não é substituída por dado inventado. | 100% dos registros exibidos possuem proveniência. |
| P0 | Como paciente, quero limitar o que meu cuidador pode consultar. | Escopo, finalidade e prazo são obrigatórios; revogação bloqueia leituras futuras; tentativa fica auditada. | 0 acessos delegados sem concessão ativa. |
| P0 | Como cuidador, quero lembrar da rotina sem alterar uma prescrição. | Registro de tomada é separado da prescrição; não há recomendação de dose, substituição ou duplicidade. | 100% das confirmações têm data, hora e ator. |
| P0 | Como paciente, quero solicitar novo horário de consulta sem achar que já está confirmado. | Solicitação e confirmação possuem estados distintos; a confirmação mostra origem e carimbo de data/hora. | 0 telas chamando solicitação de “consulta confirmada”. |
| P0 | Como paciente, quero consultar quem acessou meus dados. | A tela mostra ator, ação, finalidade, data/hora e resultado; não permite apagar eventos. | 100% das rotas clínicas geram evento de acesso. |
| P1 | Como usuário, quero um resumo assistivo dos meus registros autorizados. | Resposta tem evidências, data e limitações; bloqueia diagnóstico, prognóstico, dose e encaminhamento autônomo. | 100% das respostas de IA passam em testes de contrato de segurança. |
| P1 | Como paciente, quero comparar disponibilidade de medicamento de parceiros. | Exibe fonte, data de atualização e aviso para confirmação no estabelecimento. | 100% das ofertas indicam atualização e parceiro. |
| P2 | Como profissional, quero revisar alertas de pacientes com autorização. | Alertas apresentam versão de regra, fonte e ação de revisão; médico pode aceitar ou rejeitar com registro. | 100% dos alertas clínicos têm decisão humana rastreável. |
| P2 | Como regulador/SAMU, quero consultar sinais de capacidade de rede. | Fonte oficial, SLA, especialidade, atualização e decisão humana de regulação são obrigatórios. | Nenhuma recomendação autônoma de destino é emitida. |

## Pontos que exigem o dobro de atenção clínica

| Tema | Por que é crítico | Regra obrigatória de produto |
|---|---|---|
| Medicamentos, alergias e doses | Um erro de interpretação, duplicidade ou atraso pode causar dano relevante. | Não inferir dose, suspender ou trocar medicamento; preservar texto e origem da prescrição; alertas devem pedir conferência ou contato profissional. |
| Crianças, idosos e responsáveis | Há representação legal, autonomia progressiva, fragilidade, acessibilidade e risco de acesso indevido. | Fluxos separados para responsável legal e cuidador; escopo mínimo; interfaces com linguagem simples, fonte ampliada e confirmação de ações críticas. |
| Histórico clínico incompleto ou desatualizado | Dados ausentes podem induzir falsa segurança ou decisão inadequada. | Mostrar data, fonte e estado da sincronização; nunca completar lacunas com suposições ou IA generativa. |
| Alertas de IA | Um alerta pode ser interpretado como diagnóstico mesmo quando não foi projetado para isso. | Explicar motivo e evidência; classificá-lo como assistivo; bloquear linguagem conclusiva e manter revisão humana quando relevante. [1] |
| Receita e dispensação | A validação de receita é uma atividade regulada e a dispensação tem responsabilidade técnica farmacêutica. | A integração apenas consulta estado autorizado; decisão e validação final continuam na farmácia habilitada. |
| Emergência e capacidade hospitalar | Atraso, dado desatualizado ou recomendação errada pode agravar o atendimento. | Fora do MVP; somente com fontes homologadas, regra institucional e decisão humana de regulação. |
| Dados sensíveis e planos de saúde | Dados de saúde possuem proteção reforçada, inclusive limitações de uso compartilhado para seleção de risco. | Minimização, finalidade definida, consentimento quando aplicável, segurança e proibição de perfilamento de risco. [2] |

## Melhorias prioritárias após a fundação

O primeiro aprimoramento deve ser a implementação completa de identidade, consentimento e auditoria, e não a expansão de telas. Sem essa base, qualquer integração pode aumentar o risco de vazamento ou acesso indevido. Em seguida, o produto deve validar uma única integração de agenda com uma instituição piloto e uma única fonte de histórico ou documento, mantendo o restante em estado explicitamente indisponível.

O agente de IA deve evoluir por etapas: inicialmente sumarização e organização de registros autorizados; depois alertas de regra simples revisados por clínico; somente após validação, monitoramento e análise regulatória deve-se considerar qualquer apoio relevante à decisão. A norma do CFM exige governança, auditoria, transparência, classificação de risco e supervisão humana para IA aplicada à medicina. [1]

## Definition of Done

Um cartão só pode ser marcado como concluído quando houver evidência de que atende aos critérios abaixo.

| Dimensão | Evidência requerida |
|---|---|
| Produto | História, fluxo alternativo, estado vazio, erro e carregamento definidos; sem promessa enganosa sobre disponibilidade ou confirmação. |
| Clínica | Regras, textos e alertas revisados por responsável clínico; limites explícitos e sem decisão autônoma da aplicação. |
| Segurança e privacidade | Autorização de menor privilégio, validação de entrada, nenhum segredo em código, minimização de dados, auditoria e teste negativo de acesso. |
| Dados | Contrato versionado, proveniência, idempotência e validação de origem; dados sintéticos em desenvolvimento e homologação. |
| Engenharia | Testes TDD relevantes aprovados, tipos e lint aprovados, revisão de código, observabilidade e possibilidade de reversão. |
| Acessibilidade | Leitor de tela, foco, rótulos, contraste, área de toque e fonte ampliada verificados. |
| Aceite | PO confirma valor, QA confirma cenários e representante do público-alvo participa da homologação quando aplicável. |

## Validação pelo cliente

Como cliente, o pedido está **atendido parcialmente e de forma segura** nesta primeira fundação. A proposta já contempla Android, arquitetura limpa, TDD, trilha de auditoria planejada, proteção de dados, IA assistiva limitada, jornadas de paciente/cuidador e preparação para Web/iOS e parceiros. Ainda não estão implementadas as integrações reais, autenticação produtiva, sincronização com fontes clínicas, notificações nativas, farmacêuticas, operadoras, SAMU ou hospitais. Esses itens dependem de contratos, homologação técnica, dados operacionais e governança clínica antes de qualquer liberação ao público.

| Pergunta de validação | Estado atual | Próxima prova necessária |
|---|---|---|
| O paciente terá acesso rápido à própria informação? | Estrutura e navegação prontas; dados reais ainda não conectados. | Conectar uma fonte piloto com consentimento e proveniência. |
| O cuidador poderá acompanhar rotinas? | Política de acesso por escopo e prazo definida e testada. | Implementar consentimento, notificações e registro persistente. |
| Hospitais reduzirão filas? | Modelo de agenda e solicitação definido. | Homologar uma integração de agenda com instituição piloto. |
| Farmácias validarão receitas e estoques? | Limites e adaptadores previstos. | Acordo e integração autorizada com parceiros e revisão regulatória. |
| SAMU escolherá destino? | Deliberadamente fora do MVP. | Fonte operacional, governança de regulação e piloto institucional. |
| A IA ajudará com segurança? | Limites técnicos e clínicos definidos. | Implementar contratos, logs, avaliação e revisão humana. |

## Referências

[1] [Conselho Federal de Medicina — CFM normatiza uso da IA na medicina](https://portal.cfm.org.br/noticias/cfm-normatiza-uso-da-ia-na-medicina/)

[2] [Lei nº 13.709/2018 — LGPD, dados pessoais sensíveis](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm)
