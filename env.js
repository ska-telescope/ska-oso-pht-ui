export const env = {
  //    ...process.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {}),
  REACT_APP_SKA_PHT_API_URL: 'http://localhost:5000',
  REACT_APP_SKA_PHT_UPLOAD_API_URL:
    'http://localhost:5000/upload/pdf',
  REACT_APP_USE_LOCAL_DATA: true
};
