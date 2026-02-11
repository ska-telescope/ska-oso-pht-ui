import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Loader from '@components/layout/Loader/Loader';
import PHT from '@/pages/PHT/PHT';
import { SKAThemeProvider, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

declare const window: any;

function App() {
  const [themeMode, setThemeMode] = React.useState(
    localStorage.getItem('skao_theme_mode') === THEME_DARK ? THEME_DARK : THEME_LIGHT
  );

  const [accessibilityMode, setAccessibilityMode] = React.useState(
    Number(localStorage.getItem('skao_accessibility_mode')) || 0
  );
  return (
    <React.Suspense fallback={<Loader />}>
      <ThemeA11yProvider>
        <SKAThemeProvider themeMode={themeMode} accessibilityMode={accessibilityMode}>
          <Router basename={window?.env?.REACT_APP_SKA_PHT_BASE_URL || '/'}>
            <PHT
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              accessibilityMode={accessibilityMode}
              setAccessibilityMode={setAccessibilityMode}
            />
          </Router>
        </SKAThemeProvider>
      </ThemeA11yProvider>
    </React.Suspense>
  );
}

export default App;
