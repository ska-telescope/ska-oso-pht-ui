import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';

import theme from '@services/theme/theme.tsx';
import Loader from '@components/layout/Loader/Loader';
import PHT from '@/pages/PHT/PHT';

declare const window: any;

function App() {
  const [theMode] = React.useState(
    localStorage.getItem('skao_theme_mode') !== THEME_DARK ? THEME_LIGHT : THEME_DARK
  );

  return (
    <ThemeProvider theme={theme(theMode)}>
      <CssBaseline enableColorScheme />
      <React.Suspense fallback={<Loader />}>
        <Router basename={window?.env?.REACT_APP_SKA_PHT_BASE_URL || '/'}>
          <PHT />
        </Router>
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
