describe("Pin Screen", () => {
  it("Enter Pin Screen - Enter valid PIN", () => {
    cy.visit("/");
    cy.url().should("include", "/auth/unlock");
    cy.getByTestAttr("button-pin-1").should("exist").click();
    cy.getByTestAttr("button-pin-2").should("exist").click();
    cy.getByTestAttr("button-pin-3").should("exist").click();
    cy.getByTestAttr("button-pin-4").should("exist").click();
    cy.getByTestAttr("button-confirm-pin").should("exist").click();
    cy.url().should("include", "/pre");
    cy.url().should("include", "/chat");
  });

  it("Enter Pin Screen - Enter PIN with 3 digits", () => {
    cy.visit("/");
    cy.url().should("include", "/auth/unlock");
    cy.getByTestAttr("button-pin-1").should("exist").click();
    cy.getByTestAttr("button-pin-2").should("exist").click();
    cy.getByTestAttr("button-pin-3").should("exist").click();
    cy.getByTestAttr("button-confirm-pin").should("exist").and("be.disabled");
  });
});
