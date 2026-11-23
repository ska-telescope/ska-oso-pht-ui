import { afterEach, describe, expect, test } from 'vitest';
import { env } from '@/env';
import { getAuthCallbackUri, getRedirectUri } from './authConfig';

const originalRedirectUri = env.MSENTRA_REDIRECT_URI;

describe('redirect URIs', () => {
  afterEach(() => {
    env.MSENTRA_REDIRECT_URI = originalRedirectUri;
  });

  // Deployed charts set a relative path (ska-oso-pht-ui.urls-redirectUri); MSAL needs it
  // absolute (BTN-3402)
  test('resolves a relative redirect URI against the page origin', () => {
    env.MSENTRA_REDIRECT_URI = '/ci-ska-oso-pht-ui/pht/';
    expect(getRedirectUri()).toBe(`${window.location.origin}/ci-ska-oso-pht-ui/pht/`);
    expect(getAuthCallbackUri()).toBe(
      `${window.location.origin}/ci-ska-oso-pht-ui/pht/auth-callback.html`
    );
  });

  test('puts auth-callback.html next to the app when the redirect URI is the origin', () => {
    env.MSENTRA_REDIRECT_URI = 'http://localhost:6101';
    expect(getAuthCallbackUri()).toBe('http://localhost:6101/auth-callback.html');
  });

  test('puts auth-callback.html inside the app path when it has no trailing slash', () => {
    env.MSENTRA_REDIRECT_URI = 'https://example.org/ns/pht';
    expect(getAuthCallbackUri()).toBe('https://example.org/ns/pht/auth-callback.html');
  });
});
