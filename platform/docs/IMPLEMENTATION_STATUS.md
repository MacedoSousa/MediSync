# Status de Implementação

## Concluído e validado

As histórias US-001 a US-019 possuem implementações e regressões no projeto: identidade, responsável legal, cuidador, consentimento, auditoria, contatos cifrados, linha do tempo demonstrativa, contrato de importação, medicamentos e lembretes, agenda confirmada e reagendamento rastreável. A US-021 adiciona resumo assistivo com evidências e bloqueios; a contingência de emergência não depende de IA.

As histórias internas US-022, US-023, US-030 e US-031 também estão concluídas. A plataforma inclui fila administrativa de regras da IA, aprovação ou rejeição auditável, métricas agregadas sem conteúdo clínico, tela de transparência e desligamento individual, contratos de área segura/haptics/lembretes para iOS e observabilidade HTTP com `X-Correlation-Id`, logs sanitizados e verificação não destrutiva de recuperação.

O protótipo autocontido inclui um diretório pesquisável de profissionais, especialidades e serviços inteiramente sintéticos, com filtros ilustrativos de SUS, convênio, modalidade e acessibilidade. Inclui também cenários de teleatendimento, contato, benefícios farmacêuticos, solicitações de agenda, fila institucional, cobertura, receita digital, capacidade e alertas de vigência. Os papéis de paciente, responsável, cuidador, profissional, organização, farmácia, operadora, regulação e administração possuem visões demonstrativas segregadas por escopo mínimo.

Todas as jornadas sintéticas possuem selo de demonstração e bloqueio explícito de chamadas, mensagens, compras, reservas, consultas de estoque, preços, cobertura, atendimento, dispensação, despacho ou decisão externos. A IA assistiva exibe seu estado operacional; quando autorizada, o resumo usa fallback determinístico se o modelo não responder. A contingência de emergência continua local, independente de IA e de conectividade. A regressão deste marco aprovou 43 arquivos e 105 testes, e a verificação TypeScript foi concluída sem erros.

## Implementado com ativação externa pendente

| Item | Estado técnico | Bloqueio para produção |
|---|---|---|
| US-020, parceiro de agenda | Adaptador, validação, correlação e idempotência demonstrativos. | Homologação, credenciais, contrato e observabilidade do parceiro. |
| Governança produtiva da IA | Fila administrativa, papéis, decisão auditável, métricas agregadas e desligamento técnico implementados. | Nomeação dos responsáveis, critérios clínicos formais e aprovação institucional das regras. |
| RNDS/FHIR | Contrato interno e fronteira de validação. | Processo institucional, perfis, ambiente e homologação RNDS. |
| US-024 a US-029, parceiros institucionais | Limites, contratos e pontos de extensão documentados. | Fontes oficiais, autorização, SLAs, contratos e acordos regulatórios. |

## Itens não caracterizados como serviço clínico

Dados, imagens, documentos e consultas exibidos pelo modo demonstrativo são sintéticos. Eles não equivalem a prontuário, receita, laudo, exame, agendamento, disponibilidade, preço, cobertura ou capacidade assistencial reais.

## Próximo ciclo de engenharia

Instituir pipeline de CI, formalizar os critérios de homologação de parceiros e implementar integrações institucionais somente com fontes contratuais autorizadas. A primeira entrega produtiva deve incluir validação em iPhone físico, testes de restauração em ambiente isolado e revisão humano-clínica da governança da IA. O quadro detalhado e histórico de execução permanecem em [`todo.md`](../todo.md) e [`BACKLOG.md`](../BACKLOG.md).
