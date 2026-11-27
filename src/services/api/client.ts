import axios from 'axios';
import {
  CommonOSOAPIEndpointsApiFactory,
  Configuration,
  ODTAPIApiFactory,
  PHTAPIReportApiFactory,
  PMTAPIPanelDecisionApiFactory,
  PMTAPIPanelManagementApiFactory,
  PMTAPIReviewersApiFactory,
  PMTAPIReviewsApiFactory,
  PPTAPIProposalAccessManagementApiFactory,
  PPTAPIProposalPreparationApiFactory
} from '@/generated';
import { SKA_OSO_SERVICES_URL } from '@utils/constants';
import { getRequestTimeoutMs } from './auth';
import { getLocalToken, isLocalhost } from './localAuthToken';

// TODO: come back to this and consolidate with the ODT UI. The ODT passes window.env.BACKEND_URL
// straight to the generated factories as the basePath, because its backend URL is just the
// origin (plus any namespace prefix). Here SKA_OSO_SERVICES_URL already ends in /oso/api/vN,
// which the generated paths include, so it has to be stripped to avoid doubling it up.
const OSO_API_SUFFIX = /\/oso\/api\/v\d+\/?$/;

export const osoApiBasePath = (SKA_OSO_SERVICES_URL ?? '').replace(OSO_API_SUFFIX, '');

export const osoApiConfiguration = new Configuration({
  basePath: osoApiBasePath,
  baseOptions: { timeout: getRequestTimeoutMs() }
});

/**
 * The generated clients for ska-oso-services, one per API section. They send their requests
 * through the global axios instance, where useAxiosInterceptor adds the user's token.
 *
 * Only the API layer (src/services/api) uses these.
 */
export const api = {
  proposals: PPTAPIProposalPreparationApiFactory(osoApiConfiguration),
  access: PPTAPIProposalAccessManagementApiFactory(osoApiConfiguration),
  panels: PMTAPIPanelManagementApiFactory(osoApiConfiguration),
  panelDecisions: PMTAPIPanelDecisionApiFactory(osoApiConfiguration),
  reviews: PMTAPIReviewsApiFactory(osoApiConfiguration),
  reviewers: PMTAPIReviewersApiFactory(osoApiConfiguration),
  report: PHTAPIReportApiFactory(osoApiConfiguration),
  odt: ODTAPIApiFactory(osoApiConfiguration),
  common: CommonOSOAPIEndpointsApiFactory(osoApiConfiguration)
};

/**
 * An axios instance for the endpoints open to the public (e.g. coordinates, visibility, the
 * Sensitivity Calculator), which have to work when no one is logged in. It doesn't go through
 * useAxiosInterceptor, which on the global axios would reject the request, or redirect to login,
 * without a session.
 */
export const publicAxios = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// On local deployments the auth cookie is not sent (different origin via the dev proxy), so a
// bearer token is attached when there is one. No-op on remote deployments.
publicAxios.interceptors.request.use(async (config) => {
  if (isLocalhost()) {
    const token = await getLocalToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** The generated clients for the public endpoints, sending through publicAxios. */
export const publicApi = {
  common: CommonOSOAPIEndpointsApiFactory(osoApiConfiguration, undefined, publicAxios)
};
