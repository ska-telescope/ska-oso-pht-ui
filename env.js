export const env = {
//    ...process.env,
    ...window.env,
    ...(typeof Cypress !== 'undefined' ? Cypress.env() : {})
  };
  