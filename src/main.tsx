import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n/i18n';
import { AuthProvider } from '@ska-telescope/ska-login-page';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import App from './App/App';
import { buildAuthConfig } from './utils/authConfig';
import CypressMsalHydrationBridge from './testSupport/CypressMsalHydrationBridge';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AuthProvider {...buildAuthConfig()}>
        <App />
        <CypressMsalHydrationBridge />
      </AuthProvider>
    </StoreProvider>
  </StrictMode>
);
