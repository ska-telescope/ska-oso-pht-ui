import { Configuration } from '@/generated';
import { SKA_OSO_SERVICES_URL } from '@utils/constants';
import { getRequestTimeoutMs } from '../axiosAuthClient/axiosAuthClient';

// TODO: come back to this and consolidate with the ODT UI. The ODT passes window.env.BACKEND_URL
// straight to the generated factories as the basePath, because its backend URL is just the
// origin (plus any namespace prefix). Here SKA_OSO_SERVICES_URL already ends in /oso/api/vN,
// which the generated paths include, so it has to be stripped to avoid doubling it up.
const OSO_API_SUFFIX = /\/oso\/api\/v\d+\/?$/;

export const osoApiBasePath = (SKA_OSO_SERVICES_URL ?? '').replace(OSO_API_SUFFIX, '');

export const osoApiConfiguration = new Configuration({
  basePath: osoApiBasePath,
  // Same timeout as useAxiosAuthClient's instance: REQUEST_TIMEOUT_MS from the chart's
  // runtimeEnv.requestTimeoutMs, falling back to 20 seconds when unset
  baseOptions: { timeout: getRequestTimeoutMs() }
});
