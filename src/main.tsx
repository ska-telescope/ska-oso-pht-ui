import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';
import './services/i18n/i18n';
import { AuthProvider } from '@ska-telescope/ska-login-page';
import { StoreProvider } from '@utils/storage/store';
import App from './App/App';
import { buildAuthConfig } from './utils/authConfig';
import { isAuthResponseForAnotherWindow } from './utils/authRedirectBridge/authRedirectBridge';

if (isAuthResponseForAnotherWindow(window)) {
  // Response to an MSAL silent (hidden iframe) or popup request - pass it back instead of starting the app
  broadcastResponseToMainFrame().catch((error) =>
    console.warn('[MSAL] could not pass the auth response back to the app:', error)
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <StoreProvider>
        <AuthProvider {...buildAuthConfig()}>
          <App />
        </AuthProvider>
      </StoreProvider>
    </StrictMode>
  );
}
