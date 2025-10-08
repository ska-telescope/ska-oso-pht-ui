export const viewPort = (format = 'pc') => {
  const isPC = () => format === 'pc';
  const xAxis = isPC() ? 2000 : 600;
  const yAxis = isPC() ? 1200 : 600;
  cy.viewport(xAxis, yAxis);
};

/*----------------------------------------------------------------------*/

export const click = testId =>
  get(testId)
    .scrollIntoView()
    .should('exist')
    .should('be.visible')
    .click();
export const entry = (testId, value) => get(testId).type(value);
export const get = testId => cy.get('[data-testid="' + testId + '"]');
export const selectId = id => cy.get('[id="' + id + '"]').click({ force: true });
export const selectValue = value => cy.get('[data-value="' + value + '"]').click({ force: true });
export const verifyContent = (testId, value) => get(testId).should('contain.text', value);
export const verifyExists = testId => get(testId, { timeout: 10000 }).should('exist');
export const verifyVisible = testId =>
  get(testId)
    .scrollIntoView()
    .should('be.visible');
export const getCheckboxInRow = index => {
  return cy.get(`[data-rowindex="${index}"]`).find('input[type="checkbox"]');
};
