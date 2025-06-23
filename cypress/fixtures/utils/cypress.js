export const viewPort = (format = 'pc') => {
  const isPC = () => format === 'pc';
  const xAxis = isPC() ? 2000 : 600;
  const yAxis = isPC() ? 1200 : 600;
  cy.viewport(xAxis, yAxis);
};

/*----------------------------------------------------------------------*/

export const click = testId => cy.get('[data-testid="' + testId + '"]').click();
export const entry = (testId, value) => cy.get('[data-testid="' + testId + '"]').type(value);
export const selectId = id => cy.get('[id="' + id + '"]').click({ force: true });
export const selectValue = value => cy.get('[data-value="' + value + '"]').click({ force: true });
export const verifyContent = (testId, value) =>
  cy.get('[data-testid="' + testId + '"]').should('contain.text', value);
export const verifyExists = testId => cy.get('[data-testid="' + testId + '"]').should('exist');
