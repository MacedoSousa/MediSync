# Status de Implementação

## Concluído e validado

As histórias US-001 a US-019 possuem implementações e regressões no projeto: identidade, responsável legal, cuidador, consentimento, auditoria, contatos cifrados, linha do tempo demonstrativa, contrato de importação, medicamentos e lembretes, agenda confirmada e reagendamento rastreável. A US-021 adiciona resumo assistivo com evidências e bloqueios; a contingência de emergência não depende de IA.

## Implementado com ativação externa pendente

| Item | Estado técnico | Bloqueio para produção |
|---|---|---|
| US-020, parceiro de agenda | Adaptador, validação, correlação e idempotência demonstrativos. | Homologação, credenciais, contrato e observabilidade do parceiro. |
| US-022, governança da IA | Catálogo, bloqueio, revisão e persistência de metadados iniciados. | Processo humano formal, responsáveis, métricas e política de aprovação. |
| RNDS/FHIR | Contrato interno e fronteira de validação. | Processo institucional, perfis, ambiente e homologação RNDS. |
| Farmácias, operadoras e emergência institucional | Somente limites e contratos de arquitetura. | Fontes oficiais, autorização, SLAs e acordos regulatórios. |

## Itens não caracterizados como serviço clínico

Dados, imagens, documentos e consultas exibidos pelo modo demonstrativo são sintéticos. Eles não equivalem a prontuário, receita, laudo, exame, agendamento, disponibilidade, preço, cobertura ou capacidade assistencial reais.

## Próximo ciclo de engenharia

Concluir a governança administrativa da IA, documentar critérios de homologação de parceiros, instituir pipeline de CI e implementar portais institucionais apenas com fontes contratuais autorizadas. O quadro detalhado e histórico de execução permanecem em [`todo.md`](../todo.md) e [`BACKLOG.md`](../BACKLOG.md).
