export const env = {
  //    ...process.env,
  ...window.env,
  ...(typeof Cypress !== 'undefined' ? Cypress.env() : {}),
  /* PHT API */
  // REACT_APP_SKA_PHT_API_URL: '/<namespace>/pht/api/v1', // deployed url should be something like that TODO: set it properly once helm chart issue resolved
  REACT_APP_SKA_PHT_API_URL: 'http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1', // local dev url
  /* SENSITIVITY CALCULATOR API */
  REACT_APP_SKA_SENSITIVITY_CALC_URL: 'http://192.168.49.2/ska-ost-senscalc-ui/api/', // local dev url
  // REACT_APP_SKA_SENSITIVITY_CALC_URL: `$KUBE_HOST/$KUBE_NAMESPACE/api`, // url should be something similar when we deploy TODO: set helm charts to use sens cal as dependency
  // REACT_APP_SKA_SENSITIVITY_CALC_URL: 'https://sensitivity-calculator.skao.int/api/', // live url to use if no access to sens cal back-end for dev
  REACT_APP_USE_LOCAL_DATA: true
};
