# Matriz de Execução do Protótipo Autocontido

## Objetivo

Este ciclo transforma todas as jornadas que podem ser demonstradas com segurança em experiências locais, sintéticas e verificáveis. Nenhuma tela, dado ou ação deste documento estabelece atendimento, preço, estoque, cobertura, capacidade, prescrição, agendamento, contato ou decisão clínica reais.

> **Regra de produto:** quando uma fonte externa não estiver contratada e homologada, a interface usa dados sintéticos rotulados e bloqueia ações que gerariam efeito fora do aplicativo.

## Escopo executável neste ciclo

| História ou domínio | Entrega interna do protótipo | Limite obrigatório |
|---|---|---|
| US-024 e US-036 — Farmácia | Catálogo, filtros, ofertas, vigência e detalhe sintéticos. | Sem preço, estoque, compra, reserva, entrega ou indicação terapêutica reais. |
| US-025 — Receita digital | Painel de estado demonstrativo e histórico de consulta ilustrativo. | Sem validar, dispensar, renovar, assinar ou expor receita real. |
| US-026 e US-032 — Portais e acessos | Seletor de perfil, matrizes de escopo e painéis responsivos por papel. | Sem acesso a organização real ou elevação de privilégio pelo cliente. |
| US-027 e US-034 — Agenda | Fila, cenários de solicitação e confirmação por fonte demonstrativa. | Sem reservar horário, notificar instituição ou afirmar disponibilidade. |
| US-028 — Cobertura | Visão ilustrativa de benefícios e estados de cobertura. | Sem autorização, elegibilidade ou reembolso real. |
| US-029 — Capacidade | Painel regulatório fictício com necessidade de decisão humana. | Sem despacho, encaminhamento ou recomendação de destino. |
| US-035 — Telemedicina e contato | Sala de espera e disponibilidade visual demonstrativas. | Sem vídeo, áudio, mensagem, ligação, contato ou atendimento reais. |
| US-037 — Vigência | Alertas neutros de datas de documentos, consentimentos e benefícios. | Sem interpretar validade clínica ou renovar documentos. |
| US-038 — IA assistiva | Estado operacional, resposta degradada e contingência local. | Sem triagem, diagnóstico, prescrição, decisão ou acionamento autônomo. |

## Bloqueios exclusivamente externos

| Dependência | O que permanece bloqueado | Condição para ativar em produção |
|---|---|---|
| Agenda, clínicas e hospitais | Consulta ou mutação de horários reais. | Contrato, credenciais, homologação, SLA e testes de integração. |
| Farmácias e receitas digitais | Dados reais de medicamento, preço, estoque, promoção e receita. | Fonte autorizada, regras de privacidade, validação farmacêutica e homologação. |
| Operadoras | Cobertura, elegibilidade e autorização reais. | Integração contratual, consentimento, rastreabilidade e regras de negócio da operadora. |
| Regulação e capacidade hospitalar | Disponibilidade institucional e qualquer encaminhamento. | Integração oficial, responsabilidade regulatória humana e protocolos acordados. |
| Telemedicina | Chamada, contato e atendimento efetivos. | Prestador autorizado, consentimento, política de privacidade e governança clínica. |

## Critérios de aceite para cada tela sintética

Cada funcionalidade demonstrativa deve exibir proveniência `Demonstração MedSync`, identificar a ausência de integração externa e impedir transações fora do aplicativo. Os testes devem confirmar que não há URL, telefone, e-mail, compra, reserva, despacho, consulta de estoque ou decisão clínica oculta. Eventos de interface não devem conter texto clínico livre, token de sessão ou dado pessoal.

## Sequência de implementação

O seletor de perfis, os portais, os painéis institucionais, as conexões demonstrativas entre diretório e agenda, o catálogo farmacêutico, os alertas e o estado operacional da IA foram concluídos neste ciclo. A ativação de produção continua fora deste ciclo e requer exclusivamente as condições de homologação listadas neste documento.
