import React from 'react';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { MSENTRA_API_URI } from '@/utils/constants';
import { getAuthCallbackUri, getUseIndigo } from '@/utils/authConfig';
import { env } from '@/env';
import { isLocalhost } from './localAuthToken';

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

export type MsalInstance = ReturnType<typeof useMsal>['instance'];

const DEFAULT_REQUEST_TIMEOUT_MS = 20000;

// Test deployments raise this through REQUEST_TIMEOUT_MS (the chart's runtimeEnv.requestTimeoutMs),
// as a backend with a lot of test data can take longer to answer than users should wait
export const getRequestTimeoutMs = (): number => {
  const configured = Number(env.REQUEST_TIMEOUT_MS);
  return configured > 0 ? configured : DEFAULT_REQUEST_TIMEOUT_MS;
};

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

export type MsalAccount = ReturnType<MsalInstance['getAllAccounts']>[number];

// Shared by the request interceptor below and by the localhost token provider (see
// useAxiosInterceptor) - both just need a silently-acquired access token for the current account.
export const acquireAccessToken = (instance: MsalInstance, account: MsalAccount): Promise<string> =>
  instance.acquireTokenSilent(silentRequest(account)).then((r) => r.accessToken);

// With no refresh tokens from Indigo, MSAL gets every silent token from Indigo in a hidden iframe,
// which Indigo sends to auth-callback.html rather than loading the whole app in it
export const silentRequest = (account: MsalAccount, forceRefresh = false) => ({
  ...loginRequest,
  account,
  ...(forceRefresh ? { forceRefresh } : {}),
  ...(getUseIndigo() ? { redirectUri: getAuthCallbackUri() } : {})
});

// localhost only: no MSAL account snapshot yet - either genuinely not logged in, or MSAL just
// hasn't finished initializing/processing a redirect if the interceptor fires very early after
// page load (MsalProvider kicks both off in a useEffect, which can run after a child's first
// request). Both instance.initialize() and instance.handleRedirectPromise() memoize their result
// internally, and waits for MSAL's actual startup to finish before concluding there's really no session.
const resolveLocalhostAccount = async (
  instance: MsalInstance
): Promise<MsalAccount | undefined> => {
  await instance.initialize();
  await instance.handleRedirectPromise().catch(() => {});
  return instance.getAllAccounts()[0];
};

export const createRequestInterceptor =
  (instance: MsalInstance) => async (request: InternalAxiosRequestConfig) => {
    // Requests made through the generated client carry their full URL in `url` with no
    // `baseURL`, so check both.
    const isHttp = request?.baseURL?.startsWith(HTTP) || request?.url?.startsWith(HTTP);
    if (isHttp && !isLocalhost()) {
      return Promise.reject('HTTP is not allowed except on localhost.');
    } else if (!isLocalhost() && request.baseURL && !request.baseURL.startsWith(HTTPS)) {
      request.baseURL = request.baseURL.replace(HTTP, HTTPS);
    }

    let account: MsalAccount | undefined = instance.getAllAccounts()[0];
    if (!account && isLocalhost()) {
      account = await resolveLocalhostAccount(instance);
    }

    if (account) {
      try {
        request.headers['Authorization'] = `Bearer ${await acquireAccessToken(instance, account)}`;
        return request;
      } catch (error) {
        // A concurrent forced refresh (e.g. RefreshAuthToken, fired after creating a proposal or
        // panel) can transiently fail an overlapping silent acquisition for the same account, even
        // though the user is still genuinely signed in - retry once after a short delay before
        // treating this as a real logged-out session and tearing down the app with a full-page
        // redirect.
        if (error instanceof InteractionRequiredAuthError) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 250));
            request.headers['Authorization'] =
              `Bearer ${await acquireAccessToken(instance, account)}`;
            return request;
          } catch (retryError) {
            if (retryError instanceof InteractionRequiredAuthError && !loginRedirectTriggered) {
              loginRedirectTriggered = true;
              console.warn(
                '[axiosAuthClient] acquireTokenSilent failed after retry, redirecting to login:',
                (retryError as InteractionRequiredAuthError).errorCode,
                (retryError as InteractionRequiredAuthError).message
              );
              instance.loginRedirect(loginRequest);
            }
            throw retryError;
          }
        }
        throw error;
      }
    }

    if (!isLocalhost()) {
      return request;
    }

    // resolveLocalhostAccount waited for MSAL startup to finish and still found no account, so
    // send the user to log in rather than silently carrying on.
    if (!loginRedirectTriggered) {
      loginRedirectTriggered = true;
      console.warn(
        '[axiosAuthClient] No MSAL account found after startup completed - redirecting to login.'
      );
      instance.loginRedirect(loginRequest);
    }
    throw new Error('No MSAL session found - redirecting to login.');
  };

// See RefreshAuthToken's own comment above for why this exists at all. Best-effort: a failed
// refresh just leaves the caller with whatever token it already had.
export const createRefreshAuthToken =
  (instance: MsalInstance): RefreshAuthToken =>
  async () => {
    const account = instance.getAllAccounts()?.[0];
    if (account) {
      await instance.acquireTokenSilent(silentRequest(account, true)).catch(() => {});
    }
  };

/**
 * The token refresh, for callers of the API layer after an action that grants new group
 * membership (see RefreshAuthToken).
 */
export const useRefreshAuthToken = (): RefreshAuthToken => {
  const { instance } = useMsal();
  return React.useMemo(() => createRefreshAuthToken(instance), [instance]);
};
