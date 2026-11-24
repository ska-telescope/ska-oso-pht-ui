import { Configuration } from '@/generated';
import { SKA_OSO_SERVICES_URL } from '@utils/constants';

// TODO: come back to this and consolidate with the ODT UI. The ODT passes window.env.BACKEND_URL
// straight to the generated factories as the basePath, because its backend URL is just the
// origin (plus any namespace prefix). Here SKA_OSO_SERVICES_URL already ends in /oso/api/vN,
// which the generated paths include, so it has to be stripped to avoid doubling it up.
const OSO_API_SUFFIX = /\/oso\/api\/v\d+\/?$/;

// Matches the timeout of the axios instance returned by useAxiosAuthClient
const REQUEST_TIMEOUT_MS = 20000;

export const osoApiBasePath = (SKA_OSO_SERVICES_URL ?? '').replace(OSO_API_SUFFIX, '');

export const osoApiConfiguration = new Configuration({
  basePath: osoApiBasePath,
  baseOptions: { timeout: REQUEST_TIMEOUT_MS }
});
