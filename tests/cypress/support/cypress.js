export const click = (testId) =>
  get(testId).scrollIntoView().should('exist').should('be.visible').click();
export const get = (testId, options) => cy.get('[data-testid="' + testId + '"]', options);

export const verifyContent = (testId, value, timeout = 10000) =>
  get(testId, { timeout }).should('contain.text', value);
export const verifyExists = (testId) => get(testId, { timeout: 10000 }).should('exist');
export const verifyVisible = (testId) => get(testId).scrollIntoView().should('be.visible');
