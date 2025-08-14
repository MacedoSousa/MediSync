# MediSync

Plataforma de saúde para facilitar o fluxo de agendamento de consultas e realização de exames, centralizando informações de histórico, receitas e uso de medicações.

## Funcionalidades previstas
- Mapas com geolocalização, exibindo hospitais, clínicas médicas e farmácias ao redor do usuário (paciente)
- Salas de videochamadas e chats de dúvidas
- Agendamento de consultas e exames (particular e público)
- Filtros avançados para agendamento: por data, médico, tipo de consulta, clínica e modalidade (particular/público)
- Envio e base histórica de exames e consultas
- Centralização de exames, receitas e documentos
- Alarmes para consumo de remédios
- Médicos podem incluir alertas para pacientes sobre o uso de remédios
- Envio de receitas para farmácias para compra de remédios; após o uso, o sistema marcará a receita como utilizada
- Autenticação de dois fatores (2FA)
- Envio de notificações via web, e-mail e WhatsApp

## Arquitetura e stack (em evolução)
- Backend: PHP
- Frontend: React
- Comunicação: REST e/ou WebSocket (a definir)
- Banco de dados: a definir

## Status do projeto
Em desenvolvimento inicial. Este README será atualizado conforme os módulos forem implementados.

## Como executar (provisório)
As instruções detalhadas de instalação e execução serão adicionadas quando os serviços estiverem disponíveis. Estrutura atual do repositório:

```
app/
README.md
```

## Segurança e LGPD
- Autenticação com 2FA (planejado)
- Criptografia de dados sensíveis (em definição)
- Políticas de privacidade, retenção e consentimento em conformidade com a LGPD (em definição)

## Roadmap (alto nível)
- MVP de agendamento e histórico de consultas/exames
- Notificações e alertas de medicação
- Integração de videoconferência e chat
- Geolocalização e descoberta de serviços de saúde
- Portal para médicos e integrações com farmácias

## Contribuição
Abrir issues e pull requests com descrições claras. Padrões de commits, testes e linters serão documentados conforme a base evoluir.

## Licença
A definir.
