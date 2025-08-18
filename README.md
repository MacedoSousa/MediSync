# MediSync

## Visão e Escopo (Resumo)

**Visão:** Plataforma centralizada para gestão de saúde, integrando pacientes, médicos, clínicas, hospitais e farmácias, promovendo praticidade, segurança e acessibilidade.

**Problema/Oportunidade:** Pacientes têm dificuldade em manter histórico médico organizado e acessível, o que prejudica o tratamento e a comunicação entre profissionais. O MediSync resolve isso centralizando informações e integrando todos os atores do ecossistema de saúde.

**Objetivos SMART:**
- Centralizar 100% dos registros médicos (consultas, exames, prescrições) até o final do 1º ano.
- Aumentar em 40% a adesão ao uso correto de medicamentos em 12 meses.
- Geolocalização com 95% de acurácia em 6 meses.
- Criptografia ponta a ponta e receitas digitais em 100% das transações já no primeiro release.
- Alcançar 10.000 usuários ativos em até 18 meses.

**Personas:**
- João (65, aposentado): quer acompanhar tratamentos e não esquecer medicamentos.
- Maria (34, mãe/profissional): quer agendar consultas para si e filhos rapidamente.
- Dr. Ricardo (45, cardiologista): quer acessar rapidamente o histórico dos pacientes.

**Stakeholders:** Pacientes, médicos, clínicas, hospitais, farmácias, órgãos reguladores.

**Proposta de Valor:**
“Para pacientes que precisam organizar e acessar sua saúde com facilidade, o MediSync é a plataforma centralizada que integra clínicas, hospitais e farmácias, oferecendo agendamento, histórico médico, prescrições digitais seguras e acompanhamento de tratamentos – tudo em um só lugar.”

**Escopo:**
- **Incluído:** Plataforma web/mobile, cadastro de pacientes/médicos/clínicas, histórico centralizado, agendamento online, geolocalização, chat/vídeo, notificações, receitas digitais, dashboard.
- **Fora do escopo inicial:** Integração com wearables, prontuário hospitalar completo, IA para diagnósticos, planos de saúde no MVP.

**Restrições/Premissas:** Criptografia ponta a ponta, LGPD, orçamento restrito, prazo web 6 meses/mobile 12 meses.

**Riscos:** Vazamento de dados, resistência de médicos, baixa adesão de pacientes, problemas legais com receitas digitais, atrasos no desenvolvimento.

**KPIs:** Usuários ativos mensais, adesão a tratamentos, tempo médio de marcação de consulta, aceitação de receitas digitais, NPS ≥ 70.

---

Plataforma de saúde para facilitar o fluxo de agendamento de consultas e realização de exames, centralizando informações de histórico, receitas e uso de medicações.

## Fluxograma de Arquivos e Vínculos

### Backend (PHP)

- **Controllers** (`app/controllers/`)
  - AlertController.php
  - CrudController.php
  - GeolocationController.php
  - MeetingController.php
  - MessageController.php
  - PrescriptionController.php
  - SchedulingController.php
- **Repositórios** (`app/repositories/`)
  - AlertRepository.php
  - GenericRepository.php
  - GeolocationRepository.php
  - MeetingRepository.php
  - MessageRepository.php
  - PrescriptionRepository.php
  - SchedulingRepository.php
  - UserRepository.php
- **Core** (`app/core/`)
  - Database.php (conexão e queries)
  - Encryption.php (criptografia de mensagens)
  - LocalstackService.php (integração S3, SNS, SQS)
- **Endpoints públicos** (`public/api/`)
  - acesso.php (exemplo de endpoint de autenticação)
- **Vínculos**:
  - Controllers usam os Repositórios para acessar dados.
  - Repositórios usam Database.php para persistência.
  - Encryption e LocalstackService são utilitários usados por controllers/repositórios conforme necessário.

### Frontend (React)

- **Páginas** (`frontend/src/pages/`)
  - AlertPage.jsx
  - GeolocationPage.jsx (exibe mapa com localização do usuário usando OpenStreetMap, conforme ODbL)
  - HomePage.jsx
  - LayoutPage.jsx
  - MapPage.jsx
  - MeetingPage.jsx
  - MessagePage.jsx
  - PacientePage.jsx
  - PrescriptionPage.jsx
  - ReceitasPage.jsx
  - SchedulingPage.jsx
- **Componentes** (`frontend/src/components/`)
  - Dashboard.jsx
  - Login.jsx
  - Register.jsx
- **App.jsx**: Define as rotas e importa as páginas/componentes.
- **main.jsx**: Ponto de entrada do React.

### Relação Backend <-> Frontend
- Cada funcionalidade do frontend possui sua própria página/component (ex: login, cadastro, agendamento, alertas, receitas, etc). Não há CRUD genérico para o usuário final.

---

## Rotas Backend (exemplo)

- `POST /api/acesso.php` — Login e cadastro
- `POST /api/agendamento` — Criar agendamento
- `GET /api/agendamento?id=...` — Buscar agendamento
- `PUT /api/agendamento?id=...` — Atualizar agendamento
- `DELETE /api/agendamento?id=...` — Cancelar agendamento (soft delete)
- `GET /api/agendamento` — Listar agendamentos
- (Repita para receitas, alertas, mensagens, reuniões, etc)

## Rotas Frontend (React Router)

- `/` — Dashboard
- `/login` — Login
- `/register` — Cadastro
- `/crud` — CRUD genérico
- `/geolocalizacao` — Geolocalização
- `/agendamento` — Agendamento
- `/agendamento-page` — Página de Agendamento
- `/map` — Mapa
- `/receitas` — Envio de Receitas
- `/receitas-page` — Receitas
- `/alertas` — Alertas
- `/mensagens` — Mensagens
- `/reunioes` — Reuniões e Chats
- `/layout` — Layout
- `/paciente` — Página do Paciente
- `/home` — Home

---

## Como navegar e programar
- Para implementar uma funcionalidade, localize a página React correspondente e o controller/repositório PHP relacionado.
- Siga o vínculo: Página → chamada REST → endpoint em `public/api/` → Controller → Repositório → Database/Core.
- Consulte este fluxograma para entender rapidamente onde editar ou criar arquivos para cada funcionalidade.

---

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
