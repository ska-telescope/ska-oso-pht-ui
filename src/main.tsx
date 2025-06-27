import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n/i18n';
import { AuthProvider } from '@ska-telescope/ska-login-page';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

import App from './App/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AuthProvider
        MSENTRA_CLIENT_ID="2445e300-54c9-470f-9578-0f54840672af"
        MSENTRA_TENANT_ID="78887040-bad7-494b-8760-88dcacfb3805"
        MSENTRA_REDIRECT_URI="http://localhost:6101"
      >
        <App />
      </AuthProvider>
    </StoreProvider>
  </StrictMode>
);
