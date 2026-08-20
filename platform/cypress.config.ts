import { defineConfig } from "cypress";

/**
 * Os testes E2E cobrem apenas a interface Web do protótipo. A aplicação deve
 * estar em execução com `pnpm dev` antes da suíte ser chamada.
 */
export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://127.0.0.1:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
  retries: {
    openMode: 0,
    runMode: 1,
  },
  screenshotsFolder: "docs/portfolio/evidence/cypress",
  screenshotOnRunFailure: true,
  video: false,
  viewportHeight: 844,
  viewportWidth: 390,
});
