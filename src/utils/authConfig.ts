import { env } from '@/env';

const USE_INDIGO_SESSION_KEY = 'pht:use_indigo';

const REQUIRED_INDIGO_KEYS = [
  'INDIGO_AUTHORITY',
  'INDIGO_CLIENT_ID',
  'INDIGO_SCOPE',
  'INDIGO_AUDIENCE'
] as const;

export function getUseIndigo(): boolean {
  const params = new URLSearchParams(window.location.search);

  // ?use_indigo=true query param (dev/test override). Persist the choice for this session
  // so it survives MSAL's redirect cycle and subsequent URL cleanup.
  if (params.has('use_indigo')) {
    const result = params.get('use_indigo') === 'true';
    sessionStorage.setItem(USE_INDIGO_SESSION_KEY, String(result));
    return result;
  }

  // Session flag set on a previous call this tab session (e.g. before the redirect).
  if (sessionStorage.getItem(USE_INDIGO_SESSION_KEY) !== null) {
    return sessionStorage.getItem(USE_INDIGO_SESSION_KEY) === 'true';
  }

  // Env var: authoritative for deployed environments. Indigo is the default - only an explicit
  // 'false' opts back out to Entra, so an unset/misconfigured USE_INDIGO fails toward the
  // auth mode the live-backend test suite (and most deployments) actually expect.
  return env.USE_INDIGO !== 'false';
}

// Returns missing required env key names when USE_INDIGO is active. Empty array = all good.
export function validateIndigoConfig(): string[] {
  if (!getUseIndigo()) return [];
  return REQUIRED_INDIGO_KEYS.filter((key) => !env[key]);
}

// Returns undefined for Entra (ButtonLogin's default User.Read is correct).
// For Indigo, overrides the scope so we don't send the MS Graph User.Read scope.
export function buildLoginRequest(): { scopes: string[] } | undefined {
  if (!getUseIndigo()) return undefined;
  return {
    scopes: env.INDIGO_SCOPE.split(' ').filter(Boolean)
  };
}

// The app's own URL, which Indigo redirects back to after a full-page login.
// (The MSENTRA_REDIRECT_URI, name dates from when we only supported Entra login.)
// Always ensure the returned URI is absolute since a relative path breaks MSAL's
// login handling (see BTN-3402).
// TODO: rename MSENTRA_REDIRECT_URI once Entra is gone.
export const getRedirectUri = (): string =>
  new URL(env.MSENTRA_REDIRECT_URI, window.location.origin).href;

// Where Indigo sends silent (hidden iframe) and popup responses: auth-callback.html next to the
// app, which only hands the response back to MSAL (see src/authCallback.ts). Must be registered
// with Indigo as a redirect URI, as well as getRedirectUri().
export const getAuthCallbackUri = (): string => {
  const appUrl = new URL(getRedirectUri());
  if (!appUrl.pathname.endsWith('/')) {
    appUrl.pathname += '/';
  }
  return new URL('auth-callback.html', appUrl).href;
};

export function buildAuthConfig() {
  if (getUseIndigo()) {
    return {
      authority: env.INDIGO_AUTHORITY,
      clientId: env.INDIGO_CLIENT_ID,
      redirectUri: getRedirectUri(),
      scope: env.INDIGO_SCOPE,
      audience: env.INDIGO_AUDIENCE
    };
  }
  return {
    MSENTRA_CLIENT_ID: env.MSENTRA_CLIENT_ID,
    MSENTRA_TENANT_ID: env.MSENTRA_TENANT_ID,
    MSENTRA_REDIRECT_URI: env.MSENTRA_REDIRECT_URI
  };
}
