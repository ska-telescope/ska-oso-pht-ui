// When users access tokens expire, we try to get fresh ones quietly in the background.
// That request happens in a hidden iframe or a quick popup window: this callback handles catching the new token and passing it back to the active app.
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

broadcastResponseToMainFrame().catch((error) =>
  console.warn('[MSAL] could not pass the auth response back to the app:', error)
);
