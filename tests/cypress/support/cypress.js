export const selectId = (id) => cy.get('[id="' + id + '"]').click();
export const selectValue = (value) => {
  cy.get(`li[role="option"][data-value="${value}"]`)
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
};

export const getCheckboxInRow = (index) => {
  return cy.get(`[data-rowindex="${index}"]`).find('input[type="checkbox"]');
};
