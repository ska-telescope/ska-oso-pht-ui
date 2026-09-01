/**
 * Helpers to inject an auth token into otherwise-unauthenticated requests when
 * running a local deployment (localhost). On a remote deployment the browser
 * sends the auth cookie automatically, but on localhost (e.g. via the vite
 * BACKEND_PROXY) that cookie is not included, so we fall back to a bearer token.
 *
 * A component that has access to MSAL (via useMsal) registers a token provider
 * through setLocalTokenProvider. The shared axiosClient request interceptor then
 * calls getLocalToken to attach the token - but only on localhost.
 */

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export const isLocalhost = (): boolean =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const setLocalTokenProvider = (provider: TokenProvider | null): void => {
  tokenProvider = provider;
};

export const getLocalToken = async (): Promise<string | null> => {
  if (!tokenProvider) {
    return null;
  }
  try {
    return await tokenProvider();
  } catch {
    return null;
  }
};
