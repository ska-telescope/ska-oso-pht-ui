export const env = {
  //    ...process.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {}),
  REACT_APP_SKA_PHT_API_URL: 'http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1/proposal',
  REACT_APP_SKA_PHT_UPLOAD_API_URL: 'http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1/upload/pdf',
  REACT_APP_USE_LOCAL_DATA: false
};
