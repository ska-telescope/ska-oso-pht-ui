import { env } from '@/env';

// Query param ?use_indigo=true overrides the deploy-time env var for dev/test use.
export function getUseIndigo(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.has('use_indigo')) {
    return params.get('use_indigo') === 'true';
  }
  return env.USE_INDIGO === 'true';
}

export function buildAuthConfig() {
  if (getUseIndigo()) {
    return {
      authority: env.INDIGO_AUTHORITY,
      clientId: env.INDIGO_CLIENT_ID,
      redirectUri: env.INDIGO_REDIRECT_URI,
      scope: env.INDIGO_SCOPE || 'openid profile email',
      audience: env.INDIGO_AUDIENCE,
    };
  }
  return {
    authority: `https://login.microsoftonline.com/${env.MSENTRA_TENANT_ID}/v2.0`,
    clientId: env.MSENTRA_CLIENT_ID,
    redirectUri: env.MSENTRA_REDIRECT_URI,
  };
}
