export const env = {
  //    ...process.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {}),
  // REACT_APP_SKA_PHT_API_URL: '/dp-naledi-dominic/pht/api/v1',
  // REACT_APP_SKA_PHT_API_URL: 'http://localhost:5000', // production url ?
  REACT_APP_SKA_PHT_API_URL: 'http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1', // local dev url - to not push
  REACT_APP_USE_LOCAL_DATA: false
};
