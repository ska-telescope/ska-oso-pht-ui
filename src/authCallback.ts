// Entry point for auth-callback.html, the redirect URI for MSAL's silent and popup requests (see
// getAuthCallbackUri in utils/authConfig.ts). MSAL v5 runs those in a hidden iframe or a popup and
// waits for this page to send it Indigo's response. Without it, every silent request that needs
// Indigo (a forced refresh, or renewing an expired token, since Indigo issues no refresh tokens)
// waits 10 seconds and fails. Full-page login still redirects to the app itself.
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

broadcastResponseToMainFrame().catch((error) =>
  console.warn('[MSAL] could not pass the auth response back to the app:', error)
);
