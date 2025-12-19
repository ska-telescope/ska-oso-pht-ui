import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n/i18n';
import { AuthProvider } from '@ska-telescope/ska-login-page';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import App from './App/App';
import { MSENTRA_CLIENT_ID, MSENTRA_REDIRECT_URI, MSENTRA_TENANT_ID } from './utils/constants';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AuthProvider
        MSENTRA_CLIENT_ID={MSENTRA_CLIENT_ID}
        MSENTRA_TENANT_ID={MSENTRA_TENANT_ID}
        MSENTRA_REDIRECT_URI={MSENTRA_REDIRECT_URI}
      >
        <App />
      </AuthProvider>
    </StoreProvider>
  </StrictMode>
);
