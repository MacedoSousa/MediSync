# Acessos Segregados e Descoberta de Serviços

## Decisão de produto

O MedSync terá um único núcleo de identidade, políticas, consentimento, auditoria e dados, com **experiências separadas por papel e organização**. Uma conta não recebe acesso por escolher uma tela: o servidor avalia papel, vínculo ativo, organização, finalidade, escopo, vigência e consentimento em cada operação. O aplicativo e o Web exibem somente rotas compatíveis com essa decisão, mas a autorização definitiva permanece no servidor.

> Nenhum portal institucional pode visualizar um prontuário inteiro por padrão. Acesso a dado de saúde exige vínculo verificável, finalidade declarada, menor escopo possível e evento de auditoria.

## Modo de protótipo

Nesta etapa, todos os perfis institucionais, organizações, profissionais, horários, ofertas, contatos, links, teleatendimentos e convênios são **dados sintéticos de demonstração**. O aplicativo deve exibir esse rótulo em cada jornada e bloquear qualquer ação que pareça criar uma consulta, iniciar um atendimento, confirmar preço, consultar cobertura ou contatar um estabelecimento real. A arquitetura preserva os contratos de integração e autorização para uma fase posterior, mas não exige credenciais, clientes ou estabelecimentos para demonstrar a experiência.

## Matriz de acesso

| Perfil | Entrada principal | Pode consultar | Pode solicitar ou registrar | Limites obrigatórios |
|---|---|---|---|---|
| Paciente | `/(patient)` | Seus dados autorizados, agenda, diretório, benefícios e alertas | Agendamento, reagendamento, preferência de IA, contatos e consentimentos | Não recebe disponibilidade, preço ou cobertura como garantia sem fonte parceira. |
| Responsável legal | `/(care-circle)` | Dados do paciente vinculado dentro da representação vigente | Consentimentos e ações permitidas pela representação | Vínculo documentado, prazo, revogação e auditoria. |
| Cuidador | `/(care-circle)` | Somente rotinas e contatos dentro do escopo concedido | Confirmação de rotina e alertas autorizados | Não acessa documentos, exames ou agenda fora do escopo. |
| Profissional de saúde | `/professional` | Lista sintética de solicitações e dados explicitamente compartilhados | Simulação de atualização institucional | No protótipo, não representa profissional real; em produção exige credencial, vínculo e auditoria. |
| Clínica ou hospital | `/organization` | Fila, agenda e diretório sintéticos | Simulação de confirmação e disponibilidade | Não acessa dados de outra organização; nenhuma integração externa é ativada. |
| Farmácia | `/pharmacy` | Catálogo, promoções, estoque e solicitações sintéticos | Simulação datada de preço, promoção e disponibilidade | Não há dispensação, receita, compra ou estabelecimento real. |
| Operadora | `/payer` | Coberturas sintéticas vinculadas ao cenário demonstrativo | Simulação de resposta com fonte fictícia | Não há consulta, cobertura ou elegibilidade real. |
| Regulação e emergência | `/regulation` | Cenários operacionais sintéticos, quando disponíveis | Simulação de atualização de capacidade | Não é ferramenta de decisão de destino e não se conecta ao SAMU. |
| Administração e conformidade | `/admin` | Metadados de auditoria, governança e integrações simuladas | Aprovação de regras e revisão de incidentes sintéticos | Sem conteúdo clínico livre em painel, log ou métrica agregada. |

## Jornadas do paciente

O paciente inicia em uma tela de descoberta, onde pode pesquisar profissional, especialidade, clínica ou hospital sintéticos. Os filtros possíveis são localização declarada, modalidade de atendimento, especialidade, aceitação de SUS, convênio informado pela fonte fictícia, acessibilidade e disponibilidade demonstrativa com data e origem. A resposta sempre mostra sua proveniência sintética e horário de atualização.

Após selecionar um resultado, a pessoa segue para uma tela de detalhes, com contatos, link institucional, orientação de deslocamento e ação de solicitar horário **simulados**. A solicitação não gera consulta real; no protótipo, seus estados são estritamente demonstrativos. A telemedicina aparece somente como experiência de interface sem câmera, chamada, chat clínico ou transmissão externa.

Alertas de vigência devem reunir mudanças de status de consentimento, datas de consulta, documentos autorizados, benefícios promocionais, disponibilidade e receitas digitais cuja fonte permita verificação. Eles são lembretes informativos; não alteram medicação, não renovam receita e não fazem inferência clínica.

## IA assistiva em todos os portais

A IA pode estar acessível como camada de explicação e organização, mas não como mecanismo de autorização, triagem, diagnóstico, prescrição ou decisão de encaminhamento. A tela deve indicar quais fontes autorizadas foram usadas, os limites da resposta, a opção de desligamento individual e a forma de solicitar revisão humana. Em emergência, o caminho determinístico para SAMU 192 e contatos autorizados permanece prioritário e independente da IA, de créditos ou de conectividade.

## Dependências de integração

| Capacidade | Fonte necessária em produção | Estado do protótipo |
|---|---|---|
| Busca de profissionais, especialidades e agenda | Diretório institucional, clínica/hospital ou fonte pública autorizada | Dados sintéticos rotulados; nenhuma disponibilidade real é afirmada. |
| Filtros SUS e convênio | Estabelecimento e operadora com data de vigência | Informação fictícia, sem cobertura, elegibilidade ou garantia. |
| Rota e deslocamento | Serviço cartográfico autorizado e localização consentida | Texto e link de interface sintéticos; sem destino ou instrução de emergência. |
| Telemedicina e contato direto | Parceiro habilitado, disponibilidade e termos aplicáveis | Demonstração visual bloqueada, sem chamada, contato ou mídia externa. |
| Preço, promoções e estoque | Farmácia parceira homologada com data de atualização | Sem preços reais, compra ou reserva; conteúdo demonstrativo estritamente rotulado. |
| Receita digital | Emissor e processo de validação farmacêutica | Nenhuma aprovação, dispensação ou autenticidade presumida. |

## Critérios de aceite transversais

Cada nova rota exige teste de autorização negativa, auditoria sem conteúdo clínico, tratamento de estado sem parceiro ou sem disponibilidade, origem e data visíveis, acessibilidade de leitor de tela e funcionamento responsivo em Android, iOS e Web. Nenhuma página pode depender da IA para exibir o contato de emergência ou oferecer orientação segura.

## Portões de liberação e riscos prioritários

| Tema | Portão obrigatório | Risco que evita |
|---|---|---|
| Papel e organização | Testes de acesso positivo e negativo por rota, organização e finalidade | Vazamento de dados entre paciente, profissional ou organizações. |
| Busca e filtros | Fonte, data de atualização, estado sem resultado e revisão de linguagem | Apresentar vaga, cobertura, rota ou preço como fato sem confirmação. |
| Agenda e contato | Transição de estado auditada e confirmação por fonte | Transformar solicitação em consulta confirmada por engano. |
| Telemedicina | Habilitação do parceiro, termos aplicáveis, consentimento e contingência | Criar atendimento clínico sem disponibilidade ou canal autorizado. |
| Farmácia e promoção | Publicador identificado, vigência e política de dados comerciais | Oferta vencida, dispensação indevida ou publicidade baseada em saúde. |
| Alertas de vigência | Testes de fuso, revogação, silêncio e conteúdo neutro | Notificação indevida, atraso ou orientação clínica não aprovada. |
| IA assistiva | Fonte mínima, regra aprovada, monitoramento e desligamento | Resposta sem evidência, indisponibilidade silenciosa ou extrapolação clínica. |
