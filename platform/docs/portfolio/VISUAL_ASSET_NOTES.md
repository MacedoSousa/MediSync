# Notas de Evidência Visual / Visual Evidence Notes

Os arquivos deste diretório complementam — e não substituem — os contratos, diagramas e relatórios técnicos versionados. Os três infográficos originais foram revisados como composições editoriais de 2560 × 1440 pixels em 20 de agosto de 2026. Eles não usam dados pessoais, prontuários, preços, disponibilidade de serviços ou alegações clínicas.

| Arquivo | Papel comunicacional | Limite de interpretação |
|---|---|---|
| `assets/optimized/medsync-ecosystem-infographic.jpg` | Mostra a visão do produto em torno de paciente, cuidador, serviço clínico, farmácia, cobertura e contingência. | É uma visão conceitual; não comprova integração ativa com qualquer organização. |
| `assets/optimized/medsync-architecture-infographic.jpg` | Mostra as camadas de cliente, fronteira de API, políticas de domínio, persistência e adaptadores. | A fonte de verdade para relações e controles é [`ARCHITECTURE.md`](../../ARCHITECTURE.md). |
| `assets/optimized/medsync-safety-infographic.jpg` | Resume privacidade, auditoria, revisão humana e contingência independente da IA. | Não altera os limites clínicos documentados no repositório. |

Todos os três ativos foram conferidos visualmente: mantêm composição editorial, contraste alto, símbolos sem texto pequeno e não expõem pessoas identificáveis ou dados de saúde. O arquivo de segurança representa uma rota de contingência que contorna a camada de IA, coerente com a política de emergência do protótipo.

> **Preservação de qualidade:** os PNGs originais e o vídeo 1280 × 720 foram salvos nos arquivos persistentes do projeto no Manus. Para manter o checkpoint e o Git leves, o repositório referencia cópias otimizadas de leitura e uma prévia compacta do vídeo; nenhum original foi apagado.

The images are editorial assets for a professional portfolio. Technical claims must be read together with the versioned architecture, validation report, and source code. The full-resolution originals are retained in the persistent project files, while the repository contains optimized, versionable derivatives.
