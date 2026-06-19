import { env } from '@/env';

export function getUseIndigo(): boolean {
  const params = new URLSearchParams(window.location.search);

  // During the OAuth2 callback MSAL encodes state as {libraryState}|{userState}.
  // We embed 'use_indigo' as the user state so the choice survives the redirect.
  if (params.has('code') && params.has('state')) {
    const parts = (params.get('state') ?? '').split('|');
    if (parts.length > 1) return parts[parts.length - 1] === 'use_indigo';
  }

  // ?use_indigo=true query param for dev/test (before the redirect).
  if (params.has('use_indigo')) return params.get('use_indigo') === 'true';

  return env.USE_INDIGO === 'true';
}

// Returns undefined for Entra (ButtonLogin's default User.Read is correct).
// For Indigo, overrides the scope so we don't send the MS Graph User.Read scope.
export function buildLoginRequest(): { scopes: string[]; state: string } | undefined {
  if (!getUseIndigo()) return undefined;
  return {
    scopes: (env.INDIGO_SCOPE || 'pht:readwrite openid profile').split(' ').filter(Boolean),
    state: 'use_indigo',
  };
}

export function buildAuthConfig() {
  if (getUseIndigo()) {
    return {
      authority: env.INDIGO_AUTHORITY,
      clientId: env.INDIGO_CLIENT_ID,
      redirectUri: env.INDIGO_REDIRECT_URI,
      scope: env.INDIGO_SCOPE || 'pht:readwrite openid profile',
      audience: env.INDIGO_AUDIENCE,
    };
  }
  return {
    MSENTRA_CLIENT_ID: env.MSENTRA_CLIENT_ID,
    MSENTRA_TENANT_ID: env.MSENTRA_TENANT_ID,
    MSENTRA_REDIRECT_URI: env.MSENTRA_REDIRECT_URI,
  };
}
