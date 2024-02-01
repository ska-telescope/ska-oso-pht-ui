export const env = {
  //    ...process.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {}),
  REACT_APP_SKA_PHT_API_URL: 'http://localhost:5000', // production url ?
  // REACT_APP_SKA_PHT_API_URL: 'http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1', // local dev url - do not push
  // REACT_APP_SKA_SENSITIVITY_CALC_URL: 'http://192.168.49.2/ska-ost-senscalc-ui/api/', // local dev url - do not push
  REACT_APP_SKA_SENSITIVITY_CALC_URL: 'http://localhost:5000"/', // usual prod url -> may be different as we may be in a different deployment environment than the senscal?
  REACT_APP_USE_LOCAL_DATA: true
};
