import { env } from '@/env';

const DEFAULT_REQUEST_TIMEOUT_MS = 20000;

// Test deployments raise this through REQUEST_TIMEOUT_MS (the chart's runtimeEnv.requestTimeoutMs),
// as a backend with a lot of test data can take longer to answer than users should wait. Kept
// apart from axiosAuthClient so that module-level config (e.g. osoApiConfig) can read it without
// pulling in MSAL and React, and without breaking tests that mock axiosAuthClient.
export const getRequestTimeoutMs = (): number => {
  const configured = Number(env.REQUEST_TIMEOUT_MS);
  return configured > 0 ? configured : DEFAULT_REQUEST_TIMEOUT_MS;
};
