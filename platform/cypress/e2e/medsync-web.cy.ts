const mobileViewport = { width: 390, height: 844 };
const desktopViewport = { width: 1280, height: 720 };

function expectNoHorizontalOverflow(expectedViewportWidth: number) {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth, "largura renderizada").to.be.at.most(expectedViewportWidth);
  });
}

describe("MedSync Web — regressões críticas do protótipo", () => {
  it("inicializa a página principal em viewport compacto sem estouro horizontal", () => {
    cy.viewport(mobileViewport.width, mobileViewport.height);
    cy.visit("/");

    cy.contains("Cuidado conectado, no seu ritmo").should("be.visible");
    cy.contains("Conhecer a privacidade").should("be.visible");
    cy.contains("O MedSync não realiza diagnóstico, prescrição, triagem ou decisão de encaminhamento.")
      .scrollIntoView()
      .should("be.visible");
    expectNoHorizontalOverflow(mobileViewport.width);
  });

  it("exibe os controles de privacidade na rota da conta", () => {
    cy.visit("/profile");

    cy.contains("Privacidade").should("be.visible");
    cy.contains("Acesso protegido").should("be.visible");
    cy.contains("Controles disponíveis").should("be.visible");
  });

  it("permite filtrar e restaurar os resultados do diretório demonstrativo", () => {
    cy.visit("/service-directory");

    cy.contains("Modo de demonstração").should("be.visible");
    cy.get('input[aria-label="Buscar por profissional, especialidade ou unidade demonstrativa"]')
      .should("be.visible")
      .type("__sem_resultado__");
    cy.contains("Nenhuma opção demonstrativa encontrada").should("be.visible");
    // O React Native Web achata o Pressable dentro da camada de lista e o Cypress
    // identifica o ancestral imediato como cobertura. A asserção abaixo confirma
    // que o evento foi entregue ao controle semântico e atualizou seu estado.
    cy.get('[role="button"][aria-label="Limpar filtros do diretório"]').scrollIntoView().click({ force: true });
    cy.contains("Nenhuma opção demonstrativa encontrada").should("not.exist");
  });

  it("mantém o explorador demonstrativo utilizável em desktop", () => {
    cy.viewport(desktopViewport.width, desktopViewport.height);
    cy.visit("/prototype-care-explorer");

    cy.contains("Agenda, catálogo e datas sem ação real").should("be.visible");
    cy.get('[role="tab"][aria-label="Exibir Farmácia"]').scrollIntoView().click({ force: true });
    cy.contains("Filtrar o catálogo fictício").should("be.visible");
    expectNoHorizontalOverflow(desktopViewport.width);
  });
});
