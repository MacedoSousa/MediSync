# Design de Interface — MedSync Saúde Integrada

## Princípios de produto

O MedSync será um aplicativo de saúde em **retrato 9:16**, orientado ao uso com uma mão, com linguagem clara e inclusiva para crianças acompanhadas por responsáveis, adultos, cuidadores e pessoas idosas. A primeira entrega é Android, porém a interface seguirá convenções de interação compatíveis com as Diretrizes de Interface Humana da Apple para reduzir a futura adaptação a iOS: hierarquia visual objetiva, controles previsíveis, áreas de toque amplas, contraste elevado, rótulos textuais além de ícones e ações importantes concentradas na zona inferior da tela.

O aplicativo não deve apresentar conclusões médicas como fatos. Alertas devem expor a fonte registrada, a data do dado, o motivo da atenção e a ação segura sugerida, como “confira a prescrição” ou “fale com a equipe assistencial”. A confirmação por profissional habilitado continuará obrigatória para decisões clínicas, receitas, doses, dispensação e encaminhamentos.

## Perfis e escopo da primeira experiência

O produto deverá suportar, por identidade e permissão, os papéis de paciente, responsável legal, cuidador, profissional de saúde, estabelecimento de saúde, farmácia, equipe de regulação/emergência e operadora. A primeira experiência Android privilegia o paciente e o cuidador, com navegação preparada para os demais painéis no ambiente Web posterior. O usuário visualiza somente as informações concedidas por ele ou por seu responsável, com consentimento revogável e histórico de acessos.

| Perfil | Necessidade principal | Limite de segurança na primeira versão |
|---|---|---|
| Paciente ou responsável | Consultas, exames, medicamentos, documentos e busca de atendimento | Nenhum diagnóstico, prescrição ou ajuste de dose pela aplicação |
| Cuidador delegado | Rotina de medicamentos, lembretes e contatos definidos | Acesso limitado por prazo, escopo e autorização do paciente ou responsável |
| Profissional e estabelecimento | Consulta do histórico autorizado, agenda, documentos e alertas confirmáveis | Visualização e atualização somente com vínculo e trilha de auditoria |
| Farmácia | Validação de autenticidade e status de dispensação de receita digital | Não substitui a checagem farmacêutica e as regras regulatórias aplicáveis |
| Regulação/SAMU | Futuro painel de capacidade, especialidades e destino assistencial | Sem cálculo autônomo de rota ou destino clínico no MVP |

## Lista de telas

| Tela | Conteúdo e funcionalidade | Prioridade |
|---|---|---|
| Boas-vindas e termos | Explicação simples sobre privacidade, limites do aplicativo, aceite e acesso de responsável | MVP |
| Entrada segura | Identificação, autenticação reforçada e recuperação de acesso; sem revelar dados em mensagens de erro | MVP |
| Início | Próxima ação relevante, medicamentos do dia, próxima consulta, alertas explicáveis e botão de ajuda | MVP |
| Minha saúde | Linha do tempo com consultas, exames, diagnósticos registrados por profissionais e documentos autorizados | MVP |
| Detalhe de evento de saúde | Dados de origem, profissional/estabelecimento, anexos, data, status e compartilhamentos vigentes | MVP |
| Medicamentos | Lista ativa, instrução transcrita da prescrição, horários, confirmação de tomada e histórico | MVP |
| Lembrete de medicamento | Tela de uma ação com nome, horário, instrução, “tomado”, “não tomado” e “preciso de ajuda” | MVP |
| Agenda | Consultas futuras, solicitação de reagendamento e instruções de preparo | MVP |
| Buscar atendimento | Busca por especialidade, modalidade e distância; disponibilidade somente quando confirmada pela fonte | MVP evolutivo |
| Farmácias e medicamentos | Pesquisa de disponibilidade e preço informado por parceiros, com data/hora da atualização | MVP evolutivo |
| Pessoas autorizadas | Conceder, revisar e revogar o acesso de cuidadores/responsáveis por escopo e validade | MVP |
| Contatos de cuidado | Médicos, responsáveis, serviço de emergência e orientações de contato | MVP |
| Central de alertas | Alertas priorizados, contexto, fonte de dados, confirmação de leitura e encaminhamento seguro | MVP |
| Privacidade e auditoria | Consentimentos, dispositivos, exportação, revogação, registro de quem acessou dados e quando | MVP |
| Perfil e acessibilidade | Dados básicos, fonte ampliada, contraste, idioma e preferências de notificação | MVP |

## Fluxos prioritários

### Consultar histórico autorizado

O paciente entra com autenticação segura, abre **Minha saúde**, filtra a linha do tempo e acessa um evento. Na tela de detalhe, poderá ler a origem do dado, os anexos e o profissional ou instituição que o registrou. O compartilhamento será realizado apenas após revisar escopo, finalidade e prazo; a ação ficará gravada no histórico de auditoria.

### Acompanhar medicamento com cuidador

O paciente ou responsável cadastra um cuidador, define quais medicamentos, contatos e alertas podem ser vistos e estabelece uma data de término. Na hora programada, o cuidador recebe lembrete com texto simples. Ao registrar “tomado” ou “não tomado”, o sistema registra data, hora e autoria; se houver risco identificado por regra clínica homologada, mostra uma orientação de contato, jamais uma instrução de dose.

### Reagendar consulta

O usuário abre **Agenda**, escolhe uma consulta e toca em **Solicitar reagendamento**. O aplicativo exibe as opções confirmadas pelo estabelecimento ou registra um pedido para retorno. A confirmação final deve conter profissional, local, modalidade, horário e instruções. O status da solicitação permanece rastreável.

### Encontrar medicamento

O usuário busca pelo medicamento da prescrição e vê estabelecimentos participantes, preço, disponibilidade e horário da última atualização. Antes de navegar à farmácia, a tela mostra que preço e estoque devem ser confirmados com o estabelecimento. Se houver receita digital integrada, a farmácia valida autenticidade, vigência e status de dispensação no servidor, preservando a decisão técnica do farmacêutico.

## Layout, navegação e interação

A barra inferior terá até cinco destinos: **Início**, **Minha saúde**, **Medicamentos**, **Agenda** e **Perfil**. Ações críticas, como “ver alerta” ou “confirmar tomada”, ficarão no terço inferior da tela, terão área mínima aproximada de 44 pontos e texto explícito. Cartões não serão o único meio de apresentar conteúdo: listas cronológicas e seções curtas devem priorizar leitura rápida em celulares simples.

Os estados de carregamento serão informativos, sem números simulados. Quando um dado não estiver conectado ou não for atualizado pelo parceiro, a tela deverá indicar “indisponível” e a data da última sincronização. O app não mostrará disponibilidade hospitalar, preço de medicamento, exame ou alerta como informação atual sem fonte e carimbo de data/hora.

## Cores e tipografia

| Elemento | Cor | Uso |
|---|---:|---|
| Azul clínico | `#075985` | Ação primária, foco, links e elementos de confiança |
| Verde cuidado | `#0F766E` | Confirmação de rotinas e estados positivos não críticos |
| Azul névoa | `#E0F2FE` | Fundo de destaque leve e blocos informativos |
| Marfim suave | `#FAFAF7` | Fundo principal com menor fadiga visual |
| Grafite | `#172033` | Texto principal e ícones de alto contraste |
| Cinza informativo | `#526070` | Texto secundário, metadados e rótulos |
| Âmbar de atenção | `#B45309` | Alertas que exigem revisão, sem indicar emergência por si só |
| Vermelho crítico | `#B42318` | Erros, indisponibilidade crítica e confirmação de ações irreversíveis |

A tipografia usará a fonte nativa da plataforma, com tamanho base mínimo de 16 sp para texto corrente, títulos claros e suporte a aumento de fonte sem quebra do fluxo principal. O sistema não dependerá exclusivamente de cor: estados e alertas utilizarão ícone, título, explicação e ação sugerida.

## Critérios de qualidade de interface

Cada tela deve funcionar com leitor de tela, texto ampliado, contraste adequado e navegação previsível. O aplicativo deverá oferecer confirmação visual e, quando apropriado, tátil em ações importantes. Nenhuma informação de saúde ficará visível nas notificações da tela bloqueada sem opt-in explícito do usuário. Nenhuma ação de emergência será automatizada; o app exibirá canais de contato e instruções aprovadas.
