# Aceite do Protótipo Autocontido

## Propósito de validação

Este documento registra o aceite de produto para o MedSync em **modo demonstrativo**. Cada jornada usa dados sintéticos, apresenta o rótulo `Demonstração MedSync` e bloqueia operações que teriam efeito fora do aplicativo. Portanto, a validação confirma uma experiência navegável e segura, não a disponibilidade de serviço clínico, institucional ou comercial real.

## Jornadas verificadas

| Jornada | Entrega demonstrativa | Critério de aceite | Limite preservado |
|---|---|---|---|
| Acesso por perfil | Central de portais para nove papéis. | A visão descreve escopo mínimo e a operação bloqueada. | Não cria credencial, organização ou privilégio real. |
| Busca de serviços | Diretório com filtros de especialidade, SUS, convênio, modalidade e acessibilidade. | A filtragem retorna somente dados sintéticos consistentes. | Não afirma endereço, rota, vaga ou disponibilidade real. |
| Agenda e teleatendimento | Cenários de solicitação, confirmação por fonte fictícia, sala de espera e contato ilustrativo. | A interface informa claramente que não há reserva ou contato. | Não envia mensagem, ligação, vídeo, notificação ou pedido externo. |
| Farmácia e vigência | Catálogo neutro, ofertas sintéticas e alertas datados. | O detalhe mostra vigência e bloqueia qualquer ação transacional. | Não consulta preço, estoque, receita, compra ou entrega reais. |
| Organização e regulação | Painéis de fila, cobertura, receita e capacidade sintéticos. | Cada painel destaca fonte fictícia e necessidade de decisão humana. | Não realiza elegibilidade, validação, despacho ou encaminhamento. |
| IA assistiva | Estado operacional, preferência individual, fallback e contingência. | A tela explica limites e mantém acesso à emergência independente. | Não diagnostica, prescreve, faz triagem ou aciona contatos. |

## Evidência técnica

A validação automatizada do marco cobre contratos de diretório, portais, jornadas institucionais, agenda, catálogo, vigências, disponibilidade da IA e regressões do núcleo. O conjunto aprovado contém **43 arquivos de teste e 105 testes**, seguido por `pnpm check` sem erros de TypeScript.

## Condição de saída para produção

> A passagem deste protótipo para produção não pode substituir a homologação de clientes, estabelecimentos, credenciais, fontes de dados, consentimentos, responsabilidades clínicas e acordos regulatórios. Até então, os bloqueios transacionais e a rotulagem de demonstração devem permanecer ativos.
