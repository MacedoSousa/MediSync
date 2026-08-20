# Relatório de Validação Automatizada

**Data de referência:** 20 de agosto de 2026.
**Escopo:** protótipo MedSync autocontido, sem dados clínicos reais, credenciais de parceiros ou dispositivo físico.

## Resultado consolidado

| Verificação | Resultado | Evidência | Limite declarado |
|---|---:|---|---|
| Lint Expo | Aprovado | `pnpm lint` | Não substitui inspeção visual humana. |
| Regressão | Aprovado | 43 arquivos e 105 testes com `pnpm test` | Exercita somente cenários automatizados. |
| Tipagem | Aprovado | `pnpm check` sem erros | Não valida integrações de produção. |
| Build da API | Aprovado | `pnpm build` gerou `dist/index.js` | Não executa implantação externa. |
| Prontidão local | Aprovado | `/api/health` respondeu após reinício controlado | Valida apenas o ambiente local. |
| Esquema Drizzle | Aprovado | `drizzle-kit check` retornou esquema consistente | Não equivale a homologação de base produtiva. |
| Exportação Web | Aprovado | Expo gerou 30 rotas estáticas e `index.html` | Não substitui revisão em navegadores e leitores de tela. |
| Composição Docker local | Aprovado | Docker Desktop no Windows: MySQL saudável, API e Web em execução | Valida somente o ambiente local de demonstração. |
| API Docker local | Aprovado | `GET http://localhost:3001/api/health` respondeu `200` com `ok: true` | Não valida autenticação OAuth nem parceiros reais. |
| Web Docker local | Aprovado | `GET http://localhost:8081/` respondeu `200` | Não substitui teste em navegadores, iOS ou Android físicos. |

## Validação operacional do Docker Desktop local

Em 20 de agosto de 2026, a composição foi executada na máquina Windows de demonstração com portas isoladas para evitar colisão com serviços já presentes. O MySQL ficou saudável no segmento privado da composição; a API foi publicada em `localhost:3001`; e a interface Web está disponível em `localhost:8081`.

| Item | Resultado | Observação de segurança e operação |
|---|---|---|
| Contexto de build | Corrigido | `.dockerignore` exclui dependências locais, artefatos, logs e `.env`, impedindo o envio de binários Windows ou segredos ao contexto Linux. |
| Exportação Expo Web | Corrigida | A configuração Metro usa o comportamento portátil padrão do NativeWind; a exportação estática foi concluída antes da construção da imagem. |
| Dependência de estilo | Confirmada | `react-native-css-interop` está declarada para o NativeWind no ambiente de build. |
| Regressão local | Aprovada | 43 arquivos de teste e 105 testes aprovados, com a chave de demonstração carregada apenas no processo de teste. |
| Tipagem local | Aprovada | `pnpm check` concluído sem erros. |

> A porta `/health` não é uma rota pública deste serviço. A verificação correta e documentada é `GET /api/health`; uma resposta `404` em `/health` não indica indisponibilidade da API.

## Limites que permanecem deliberadamente fora deste ciclo

> Nenhuma validação automatizada confirma disponibilidade real de médicos, hospitais, farmácias, operadoras, telemedicina, receita digital, rota assistencial ou capacidade hospitalar. No protótipo, esses cenários são sintéticos, identificados como demonstração e bloqueados contra ações externas.

Os testes em iPhone e Android físicos, permissões nativas, notificações em segundo plano, conectividade real, acessibilidade assistida e homologação de parceiros exigem ambiente ou contrato externo. Eles não foram simulados como se fossem aprovação de produção.

## Conclusão

O núcleo implementável sem dependência física ou externa foi validado automaticamente. Antes de ativar qualquer integração real, devem ser concluídas a homologação do parceiro, a análise de segurança e privacidade, os testes em dispositivos físicos e a aprovação operacional responsável.
