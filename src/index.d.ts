declare module '@ska-telescope/ska-login-page';
declare module '@ska-telescope/ska-gui-components';
declare module 'd3-textwrap';
declare module '*.css';
declare module '@/env' {
  export const env: {
    production: boolean;
    apiUrl: string;
    REACT_APP_USE_LOCAL_DATA: string;
    REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC: string;
    REACT_APP_USE_LOCAL_DATA_PROPOSAL_REVIEW: string;
    REACT_APP_USE_LOCAL_DATA_REVIEWER_LIST: string;
    REACT_APP_USE_LOCAL_DATA_PROPOSAL_LIST: string;
    REACT_APP_SKA_OSO_SERVICES_URL: string;
    REACT_APP_SKA_OSO_AUTH_URL: string;
    REACT_APP_SKA_OSO_CLIENT_ID: string;
    REACT_APP_SKA_OSO_SCOPE: string;
    REACT_APP_SKA_SENSITIVITY_CALC_URL: string;
    MSENTRA_CLIENT_ID: string;
    MSENTRA_TENANT_ID: string;
    MSENTRA_REDIRECT_URI: string;
    REACT_APP_OVERRIDE_GROUPS: string;
  };
}
