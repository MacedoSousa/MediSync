# Testes End-to-End Web com Cypress

## Objetivo

Esta suíte executa regressões de interface exclusivamente no **Web** do protótipo MedSync. Ela não realiza testes clínicos, não aciona serviços externos e não substitui a validação em Android, iOS ou dispositivos físicos.

Os cenários protegem as melhorias recentes de inicialização, navegação, responsividade e transparência do protótipo. Nenhum teste usa credenciais de usuário, dados reais de saúde, parceiros ou chamadas de produção.

## Cobertura atual

| Cenário | Risco protegido |
|---|---|
| Renderização da tela inicial em 390×844 | Falha de inicialização, sobreposição e rolagem horizontal em viewport compacto. |
| Atalho de privacidade | Rota quebrada no fluxo de primeiros passos. |
| Diretório demonstrativo | Navegação, busca, estado vazio e restauração de filtros. |
| Navegação em 1280×720 | Regressão de rota, seleção do catálogo fictício e estouro horizontal em desktop. |

> A mensagem que limita a IA e o escopo clínico é verificada na página inicial para impedir a remoção acidental das proteções de transparência.

## Execução local

Execute a suíte sem interface com uma exportação Web estática isolada:

```bash
pnpm test:e2e
```

O comando exporta o Web com apenas um trabalhador, inicia um servidor HTTP efêmero em `127.0.0.1:4173`, executa o Cypress e encerra o servidor. Essa separação impede que o navegador de testes interrompa o Metro usado pela prévia interativa. A configuração também isola o Metro da raiz de workspace, reduzindo a varredura de dependências de automação durante o desenvolvimento.

> A exportação estática mantém a primeira renderização determinística. Os ícones usados na interface passam por uma camada compatível com SSR para evitar divergências entre o HTML exportado e a hidratação no navegador.

Para abrir o executor interativo:

```bash
pnpm test:e2e:open
```

Por padrão, o Cypress usa o servidor efêmero em `http://127.0.0.1:4173`. Para validar uma implantação local diferente, informe uma base explícita sem expor segredos:

```bash
CYPRESS_BASE_URL=http://127.0.0.1:8081 pnpm cypress run --browser electron
```

As capturas de falha ficam em `cypress/screenshots/`; a exportação temporária fica em `.cypress-web/`. Ambos são ignorados pela árvore versionada.

## Resultado de referência

Em 20 de agosto de 2026, a suíte foi executada em Electron headless com **4 cenários aprovados**. A validação complementar `pnpm test && pnpm check` também foi concluída sem falhas.
