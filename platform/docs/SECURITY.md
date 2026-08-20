# Segurança, Privacidade e Limites Clínicos

## Proteção de dados

Dados de saúde e contatos de cuidado são sensíveis. O MedSync adota minimização, origem identificada, separação de dados sintéticos, autorização no servidor e retenção limitada por finalidade. Consulte a arquitetura para as decisões completas e referências regulatórias.

| Controle | Implementação atual | Exigência antes de dados reais |
|---|---|---|
| Cifragem de campo | AES-256-GCM antes da persistência para contatos, detalhes de agenda e ativos sintéticos. | KMS/cofre, rotação, segregação de chaves e política de recuperação. |
| Sessão | OAuth, cookie seguro no servidor e armazenamento seguro no dispositivo. | MFA/step-up em operações de alto impacto e gestão de dispositivo. |
| Acesso delegado | Escopo mínimo, consentimento explícito, expiração máxima e revogação. | Verificação operacional de vínculo e revisão de acesso periódica. |
| Auditoria | Inclusão somente, hash encadeado, correlação e visualização do titular. | Imutabilidade reforçada por permissões/WORM e monitoramento independente. |
| Logs | Sem tokens e sem conteúdo clínico livre. | Retenção, SIEM e resposta a incidentes formalizados. |

## IA assistiva

O agente produz apenas organização de dados autorizados e alertas explicáveis. Sua saída deve conter evidências e aviso de limitação. Regras de bloqueio removem diagnóstico, triagem, prescrição, alteração de dose, prognóstico e encaminhamento. O componente tem desligamento controlado; sua indisponibilidade não bloqueia o uso do aplicativo.

> O fluxo de emergência é local e determinístico. Ele exibe acesso ao SAMU 192 e contatos previamente autorizados; a IA não aciona sozinha contatos, pronto-socorro ou serviços de emergência.

## Resposta a incidente

1. Conter a credencial, sessão, integração ou serviço afetado.
2. Preservar evidências de auditoria e correlação sem copiar conteúdo clínico para ferramentas não aprovadas.
3. Avaliar escopo, pessoas afetadas, dados e necessidade de comunicação regulatória/jurídica.
4. Revogar acessos, corrigir a causa, testar regressão e documentar a decisão.
5. Somente restaurar serviços após revisão técnica, de privacidade e, quando aplicável, clínica.

## Proibições de produção

 Não usar dados reais, imagens de pacientes, credenciais compartilhadas, chaves de exemplo, integração RNDS/FHIR, confirmação automatizada de agenda, indicação de hospital/SAMU, validação de receita ou cobertura de operadora sem contratos, homologação e governança específica.
