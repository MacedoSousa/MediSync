# Estrutura de Código – MediSync

> Última atualização: $(date)

Este documento descreve brevemente o propósito de cada diretório/arquivo principal do projeto. Use-o como referência rápida ao navegar no repositório.

## Raiz
| Caminho | Descrição |
|---------|-----------|
| `frontend/` | Aplicação React (Vite) |
| `public/` | DocumentRoot do backend PHP (endpoints REST) |
| `app/` | Código de domínio/back-end PHP (MVC) |
| `docs/` | Documentação (este arquivo, futuros guias) |
| `README.md` | Visão geral de alto nível e instruções de setup |

---

## Frontend `frontend/`
| Caminho | Descrição |
|---------|-----------|
| `src/main.jsx` | Entry-point React; carrega `App` |
| `src/App.jsx` | Define rotas React Router e contexto global |
| `src/pages/GeolocationPage.jsx` | Página de mapa: geolocalização do usuário, busca de estabelecimentos, painel de ações, tooltips |
| `src/components/Layout/` | `Sidebar`, `Layout`, etc. Container visual compartilhado |
| `src/styles.css` | Tema global (cores, tipografia, layout) |
| `vite.config.js` | Proxy `/api`, porta, aliases |

### Principais Funções (GeolocationPage)
- **`drawMarkers(data)`**: adiciona marcadores no mapa com tooltip + click handler.
- **`moveUser(lat,lng,desc)`**: reposiciona marcador do usuário e define origem manual.
- Hooks `useEffect` para inicializar Leaflet, watchPosition, cache em localStorage.

---

## Backend `public/api/` (exemplos)
| Arquivo | Função |
|---------|--------|
| `estabelecimentos.php` | Recebe lat/lng/radius, consulta `EstabelecimentoController`, retorna JSON de locais de saúde. |
| `acesso.php` | Login/cadastro (placeholder). |

## Backend `app/`
| Caminho | Descrição |
|---------|-----------|
| `controllers/EstabelecimentoController.php` | Integra OpenStreetMap Nominatim/Overpass para listar hospitais, farmácias, etc. |
| `core/Database.php` | Acesso PDO (a definir). |
| (demais controllers/repositories) | Estrutura gerada para futuras features (agendamento, mensagens…). |

### Fluxo de Estabelecimentos
1. Frontend faz POST `/api/estabelecimentos.php` com `{lat,lng,radius}`
2. `EstabelecimentoController::listar($lat,$lng,$radius)` executa queries Overpass.
3. Resposta é retornada ao React.

---

## Scripts & Utilidades
- **`package.json`** em `frontend/`: dependências React, Vite.
- **`composer.json`** (a criar): dependências PHP.

---

## Próximos Passos
- Documentar endpoints REST restantes.
- Adicionar diagrama de banco quando schema estiver definido.
- Gerar docs automáticas (Swagger/OpenAPI) para backend.
