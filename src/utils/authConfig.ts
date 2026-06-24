import { env } from '@/env';

const USE_INDIGO_SESSION_KEY = 'pht:use_indigo';

const REQUIRED_INDIGO_KEYS = [
  'INDIGO_AUTHORITY',
  'INDIGO_CLIENT_ID',
  'INDIGO_REDIRECT_URI',
  'INDIGO_SCOPE',
  'INDIGO_AUDIENCE',
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
  if (sessionStorage.getItem(USE_INDIGO_SESSION_KEY) !== null) return sessionStorage.getItem(USE_INDIGO_SESSION_KEY) === 'true';

  // Env var: authoritative for deployed Indigo environments.
  if (env.USE_INDIGO === 'true') return true;
}

// Returns missing required env key names when USE_INDIGO is active. Empty array = all good.
export function validateIndigoConfig(): string[] {
  if (!getUseIndigo()) return [];
  return REQUIRED_INDIGO_KEYS.filter(key => !env[key]);
}

// Returns undefined for Entra (ButtonLogin's default User.Read is correct).
// For Indigo, overrides the scope so we don't send the MS Graph User.Read scope.
export function buildLoginRequest(): { scopes: string[] } | undefined {
  if (!getUseIndigo()) return undefined;
  return {
    scopes: env.INDIGO_SCOPE.split(' ').filter(Boolean),
  };
}

export function buildAuthConfig() {
  if (getUseIndigo()) {
    // Resolve to an absolute URL so MSAL doesn't strip a trailing slash during normalization.
    const redirectUri = new URL(env.INDIGO_REDIRECT_URI, window.location.origin).href;
    return {
      authority: env.INDIGO_AUTHORITY,
      clientId: env.INDIGO_CLIENT_ID,
      redirectUri,
      scope: env.INDIGO_SCOPE,
      audience: env.INDIGO_AUDIENCE,
    };
  }
  return {
    MSENTRA_CLIENT_ID: env.MSENTRA_CLIENT_ID,
    MSENTRA_TENANT_ID: env.MSENTRA_TENANT_ID,
    MSENTRA_REDIRECT_URI: env.MSENTRA_REDIRECT_URI,
  };
}
