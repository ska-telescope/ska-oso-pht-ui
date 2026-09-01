import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { MSENTRA_API_URI } from '@/utils/constants';
import { getUseIndigo } from '@/utils/authConfig';
import { env } from '@/env';
import { isLocalhost, setLocalTokenProvider } from '../authToken/localAuthToken';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Verbose,
  Trace
}

const HTTP = 'http://';
const HTTPS = 'https://';

export const loginRequest = {
  scopes: getUseIndigo()
    ? env.INDIGO_SCOPE.split(' ').filter(Boolean)
    : [`${MSENTRA_API_URI}/pht:readwrite ${MSENTRA_API_URI}/pht:update`]
};

type MsalInstance = ReturnType<typeof useMsal>['instance'];

// The axios client returned by useAxiosAuthClient - exported so callers that only need it for
// typing (e.g. postProposal.tsx, which takes it as a parameter) don't have to reach for
// ReturnType<typeof useAxiosAuthClient>, whose shape now includes refreshAuthToken too.
export type AxiosAuthClient = AxiosInstance;

// Call after any action known to grant new group membership server-side (e.g. creating a
// proposal or panel, which calls ska-oso-services' create_membership) - acquireTokenSilent
// normally serves a cached token until it's near expiry, so without this the next request would
// carry the *pre-creation* token and its stale `groups` claim, and the new SecurityService
// permission checks (which read groups straight off the token, not a live lookup) would reject
// actions on the thing the user just created. Best-effort: on failure the caller proceeds with
// whatever token it already had, same as before this existed.
export type RefreshAuthToken = () => Promise<void>;

// Concurrent requests all failing silent token acquisition at once (e.g. on initial page load)
// would otherwise each independently call loginRedirect, navigating away repeatedly and
// cancelling every other in-flight request. Only the first should trigger the redirect.
let loginRedirectTriggered = false;

// How many times (and how long to wait between each) createRequestInterceptor retries finding an
// MSAL account before concluding there's genuinely no session - see its own comment for why.
const NO_ACCOUNT_MAX_RETRIES = 2;
const NO_ACCOUNT_RETRY_DELAY_MS = 500;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mapAxiosError = (error: AxiosError): Error => {
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    return new Error('Request timed out. Please try again.');
  }
  if (error.code === 'ESOCKETTIMEDOUT') {
    return new Error('Connection timed out. Please check your internet connection and try again.');
  }

  if (error.response?.data?.detail) {
    // This is one of the ska-oso-services errors
    return new Error(
      `${error.response?.data?.title || 'Server responded with an error'}: ${error.response?.data?.detail}`
    );
  }

  if (error.response?.status) {
    return new Error(`Server responded with an error: ${error.response.status}`);
  }

  if (error.request) {
    return new Error('No response received from the server.');
  }

  return new Error(`An error occurred: ${error.message}`);
};

type MsalAccount = ReturnType<MsalInstance['getAllAccounts']>[number];

export const createRequestInterceptor =
  (instance: MsalInstance) => async (request: InternalAxiosRequestConfig) => {
    const isHttp = request?.baseURL?.startsWith(HTTP);
    if (isHttp && !isLocalhost()) {
      return Promise.reject('HTTP is not allowed except on localhost.');
    } else if (!isLocalhost() && request.baseURL && !request.baseURL.startsWith(HTTPS)) {
      request.baseURL = request.baseURL.replace(HTTP, HTTPS);
    }

    // Shared by both the immediate account below and the retried one further down, so a silent
    // acquisition failure is handled identically either way: redirect to login (only the first
    // concurrent request does so - see loginRedirectTriggered above) and reject this request.
    const attachToken = async (account: MsalAccount) => {
      try {
        const tokenResponse = await instance.acquireTokenSilent({ ...loginRequest, account });
        request.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError && !loginRedirectTriggered) {
          loginRedirectTriggered = true;
          console.warn(
            '[axiosAuthClient] acquireTokenSilent failed, redirecting to login:',
            (error as InteractionRequiredAuthError).errorCode,
            (error as InteractionRequiredAuthError).message
          ); // Call after any action known to grant new group membership server-side (e.g. creating a
          // proposal or panel, which calls ska-oso-services' create_membership) - acquireTokenSilent
          // normally serves a cached token until it's near expiry, so without this the next request would
          // carry the *pre-creation* token and its stale `groups` claim, and the new SecurityService
          // permission checks (which read groups straight off the token, not a live lookup) would reject
          // actions on the thing the user just created. Best-effort: on failure the caller proceeds with
          // whatever token it already had, same as before this existed.
          export type RefreshAuthToken = () => Promise<void>;

          // Concurrent requests all failing silent token acquisition at once (e.g. on initial page load)
          // would otherwise each independently call loginRedirect, navigating away repeatedly and
          // cancelling every other in-flight request. Only the first should trigger the redirect.
          let loginRedirectTriggered = false;

          // How many times (and how long to wait between each) createRequestInterceptor retries finding an
          // MSAL account before concluding there's genuinely no session - see its own comment for why.
          const NO_ACCOUNT_MAX_RETRIES = 2;
          const NO_ACCOUNT_RETRY_DELAY_MS = 500;
          const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

          export const mapAxiosError = (error: AxiosError): Error => {
            if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
              return new Error('Request timed out. Please try again.');
            }
            if (error.code === 'ESOCKETTIMEDOUT') {
              return new Error(
                'Connection timed out. Please check your internet connection and try again.'
              );
            }

            if (error.response?.data?.detail) {
              // This is one of the ska-oso-services errors
              return new Error(
                `${error.response?.data?.title || 'Server responded with an error'}: ${error.response?.data?.detail}`
              );
            }

            if (error.response?.status) {
              return new Error(`Server responded with an error: ${error.response.status}`);
            }

            if (error.request) {
              return new Error('No response received from the server.');
            }

            return new Error(`An error occurred: ${error.message}`);
          };

          type MsalAccount = ReturnType<MsalInstance['getAllAccounts']>[number];

          export const createRequestInterceptor =
            (instance: MsalInstance) => async (request: InternalAxiosRequestConfig) => {
              const isHttp = request?.baseURL?.startsWith(HTTP);
              if (isHttp && !isLocalhost()) {
                return Promise.reject('HTTP is not allowed except on localhost.');
              } else if (!isLocalhost() && request.baseURL && !request.baseURL.startsWith(HTTPS)) {
                request.baseURL = request.baseURL.replace(HTTP, HTTPS);
              }

              // Shared by both the immediate account below and the retried one further down, so a silent
              // acquisition failure is handled identically either way: redirect to login (only the first
              // concurrent request does so - see loginRedirectTriggered above) and reject this request.
              const attachToken = async (account: MsalAccount) => {
                try {
                  const tokenResponse = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account
                  });
                  request.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
                } catch (error) {
                  if (error instanceof InteractionRequiredAuthError && !loginRedirectTriggered) {
                    loginRedirectTriggered = true;
                    console.warn(
                      '[axiosAuthClient] acquireTokenSilent failed, redirecting to login:',
                      (error as InteractionRequiredAuthError).errorCode,
                      (error as InteractionRequiredAuthError).message
                    );
                    instance.loginRedirect(loginRequest);
                  }
                  throw error;
                }
              };

              const account = instance.getAllAccounts()[0];
              if (account) {
                await attachToken(account);
                return request;
              }

              if (isLocalhost()) {
                // No MSAL account snapshot yet - either genuinely not logged in, or MSAL just hasn't
                // finished initializing/processing a redirect if this interceptor fires very early after
                // page load. Retry a couple of times (with a short wait - re-checking synchronously would
                // just see the same not-yet-initialized state) before concluding there's really no session
                // and sending the user to log in, rather than silently carrying on with a separately
                // sourced token.
                let retryAccount: MsalAccount | undefined;
                for (
                  let attempt = 0;
                  !retryAccount && attempt < NO_ACCOUNT_MAX_RETRIES;
                  attempt += 1
                ) {
                  await sleep(NO_ACCOUNT_RETRY_DELAY_MS);
                  retryAccount = instance.getAllAccounts()[0];
                }

                if (retryAccount) {
                  await attachToken(retryAccount);
                  return request;
                }

                if (!loginRedirectTriggered) {
                  loginRedirectTriggered = true;
                  console.warn(
                    '[axiosAuthClient] No MSAL account found after retrying - redirecting to login.'
                  );
                  instance.loginRedirect(loginRequest);
                }
                throw new Error('No MSAL session found - redirecting to login.');
              }

              return request;
            };
          instance.loginRedirect(loginRequest);
        }
        throw error;
      }
    };

    const account = instance.getAllAccounts()[0];
    if (account) {
      await attachToken(account);
      return request;
    }

    if (isLocalhost()) {
      // No MSAL account snapshot yet - either genuinely not logged in, or MSAL just hasn't
      // finished initializing/processing a redirect if this interceptor fires very early after
      // page load. Retry a couple of times (with a short wait - re-checking synchronously would
      // just see the same not-yet-initialized state) before concluding there's really no session
      // and sending the user to log in, rather than silently carrying on with a separately
      // sourced token.
      let retryAccount: MsalAccount | undefined;
      for (let attempt = 0; !retryAccount && attempt < NO_ACCOUNT_MAX_RETRIES; attempt += 1) {
        await sleep(NO_ACCOUNT_RETRY_DELAY_MS);
        retryAccount = instance.getAllAccounts()[0];
      }

      if (retryAccount) {
        await attachToken(retryAccount);
        return request;
      }

      if (!loginRedirectTriggered) {
        loginRedirectTriggered = true;
        console.warn(
          '[axiosAuthClient] No MSAL account found after retrying - redirecting to login.'
        );
        instance.loginRedirect(loginRequest);
      }
      throw new Error('No MSAL session found - redirecting to login.');
    }

    return request;
  };

const useAxiosAuthClient = (baseURL: string = '/') => {
  const { instance } = useMsal();

  // On localhost the auth cookie isn't sent, so register a token provider that
  // the shared (unauthenticated) axiosClient uses to add a bearer token instead.
  // No-op on remote deployments.
  if (isLocalhost()) {
    setLocalTokenProvider(async () => {
      const account = instance.getAllAccounts()?.[0];
      if (!account) {
        return null;
      }
      const tokenResponse = await instance.acquireTokenSilent({ ...loginRequest, account });
      return tokenResponse.accessToken;
    });
  }

  // See RefreshAuthToken's own comment above for why this exists at all. The `if (account)`
  // guard just protects the rare case where this gets called before any real MSAL session
  // exists yet.
  const refreshAuthToken: RefreshAuthToken = async () => {
    const account = instance.getAllAccounts()?.[0];
    if (!account) {
      return;
    }
    try {
      await instance.acquireTokenSilent({ ...loginRequest, account, forceRefresh: true });
    } catch (error) {
      console.warn(
        '[axiosAuthClient] refreshAuthToken failed, continuing with existing token:',
        error
      );
    }
  };

  const axiosClient = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  axiosClient.interceptors.request.use(createRequestInterceptor(instance), (error) =>
    Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(mapAxiosError(error))
  );

  return { axiosClient, refreshAuthToken };
};

export default useAxiosAuthClient;
