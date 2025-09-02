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

## Como iniciar o Frontend

### Ambiente de desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

O Vite iniciará o servidor em <http://localhost:5173>.

### Build de produção

```bash
npm run build
```

Os arquivos de saída ficarão na pasta `frontend/dist/`. Implemente-os em qualquer servidor estático de sua preferência.