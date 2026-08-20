# IA assistiva personalizada em contêiner

Este diretório contém uma **referência de ambiente controlado**, e não uma implantação clínica. O gateway aceita somente registros sintéticos, força um prompt de organização factual, valida a saída e falha de forma fechada. Quando o modelo local estiver indisponível, ele retorna `503`; o produto deve usar o resumo determinístico já existente. Emergências continuam no fluxo local do SAMU 192, independente deste serviço.

## Limites obrigatórios

| Controle | Decisão aplicada |
|---|---|
| Escopo | Organização de registros sintéticos autorizados. |
| Conteúdo vetado | Diagnóstico, prognóstico, prescrição, dose, posologia, tratamento e decisão clínica. |
| Dados reais | Não são aceitos por este protótipo. Uso com dados reais exige DPIA, base legal, contrato de operador, avaliação de segurança e aprovação clínica. |
| Rede | A porta do gateway é ligada apenas em `127.0.0.1`; não publique a inferência diretamente. |
| Falha | Resposta fechada com fallback determinístico; não há bloqueio da contingência de emergência. |

## Execução em host controlado

O serviço requer uma máquina persistente com Docker. Crie um arquivo `.env` local não versionado com um token de gateway de alta entropia e, se usar o perfil de modelo local, um diretório absoluto contendo o modelo GGUF avaliado.

```bash
ASSISTIVE_GATEWAY_TOKEN='gere-um-segredo-unico-com-32-bytes-ou-mais'
MEDSYNC_MODEL_DIRECTORY='/caminho/absoluto/para/modelos'
docker compose -f docker/ai-assistive/compose.yaml --env-file .env up --build
```

Para iniciar também o runtime local de inferência, use o perfil `local-model`. Faça isso somente após avaliar o modelo no conjunto de casos sintéticos e definir limitação de recursos, retenção zero e monitoramento no host. O modelo não deve receber credenciais, registros identificáveis ou conteúdo de urgência.
