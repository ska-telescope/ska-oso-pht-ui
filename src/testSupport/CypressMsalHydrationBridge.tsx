import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

/**
 * Exists only for Cypress. Exposes MSAL's own official loadExternalTokens() "bring your own
 * tokens" cache-seeding API on window (see tests/cypress/e2e/common/cypressTestAuth.js's
 * hydrateIndigoSession), so specs can seed a real MSAL session instantly from a genuine
 * Indigo-issued token instead of driving the full interactive loginRedirect() -> Indigo ->
 * PKCE-redirect-back flow for every test. Doesn't fake or special-case any auth logic itself -
 * loadExternalTokens() derives the account from the token and writes MSAL's own current cache
 * schema, so the result is a completely normal MSAL session, indistinguishable from a real login
 * to every other line of app code (axiosAuthClient.ts included, which carries none of this). One
 * dedicated spec still drives the real loginRedirect() flow, so that code path isn't only ever
 * exercised via this bridge.
 *
 * Rendered unconditionally from main.tsx; a no-op outside Cypress (window.Cypress is only ever
 * set by the Cypress test runner itself).
 */
export default function CypressMsalHydrationBridge(): null {
  const { instance } = useMsal();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Cypress) {
      return;
    }
    (window as unknown as { __msalLoadExternalTokens?: unknown }).__msalLoadExternalTokens = (
      request: Parameters<ReturnType<typeof instance.getTokenCache>['loadExternalTokens']>[0],
      response: Parameters<ReturnType<typeof instance.getTokenCache>['loadExternalTokens']>[1]
    ) => instance.getTokenCache().loadExternalTokens(request, response, {});
  }, [instance]);

  return null;
}
