import React from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n/i18n';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AuthProvider } from '@ska-telescope/ska-login-page';
import { MSENTRA_CLIENT_ID, MSENTRA_TENANT_ID, MSENTRA_REDIRECT_URI } from './utils/constants';
import App from './App/App';
import Loader from './components/layout/Loader/Loader';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.Suspense fallback={<Loader />}>
    <StoreProvider>
      <AuthProvider
        MSENTRA_CLIENT_ID={MSENTRA_CLIENT_ID}
        MSENTRA_TENANT_ID={MSENTRA_TENANT_ID}
        MSENTRA_REDIRECT_URI={MSENTRA_REDIRECT_URI}
      >
        <App />
      </AuthProvider>
    </StoreProvider>
  </React.Suspense>
);
