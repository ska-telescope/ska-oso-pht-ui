export const env = {
  ...import.meta.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {})
};
