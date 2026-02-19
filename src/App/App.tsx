import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Loader from '@components/layout/Loader/Loader';
import PHT from '@/pages/PHT/PHT';
import {
  SKABrandColor,
  SKAThemeProvider,
  THEME_DARK,
  THEME_LIGHT
} from '@ska-telescope/ska-gui-components';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import '@ska-telescope/ska-gui-components/dist/assets/index.css';

declare const window: any;

function App() {
  const [themeMode, setThemeMode] = React.useState(
    localStorage.getItem('skao_theme_mode') === THEME_DARK ? THEME_DARK : THEME_LIGHT
  );
  const [accessibilityMode, setAccessibilityMode] = React.useState(
    Number(localStorage.getItem('skao_accessibility_mode')) || 0
  );
  const [buttonVariant, setButtonVariant] = React.useState<typeof SKABrandColor>(
    (localStorage.getItem('skao_button_variant') as typeof SKABrandColor) ?? SKABrandColor.Blue
  );
  const [flatten, setFlatten] = React.useState(localStorage.getItem('skao_flatten') === 'true');

  return (
    <React.Suspense fallback={<Loader />}>
      <ThemeA11yProvider>
        <SKAThemeProvider
          themeMode={themeMode}
          accessibilityMode={accessibilityMode}
          buttonVariant={buttonVariant}
          flatten={flatten}
        >
          <Router basename={window?.env?.REACT_APP_SKA_PHT_BASE_URL || '/'}>
            <PHT
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              accessibilityMode={accessibilityMode}
              setAccessibilityMode={setAccessibilityMode}
              buttonVariant={buttonVariant}
              setButtonVariant={setButtonVariant}
              flatten={flatten}
              setFlatten={setFlatten}
            />
          </Router>
        </SKAThemeProvider>
      </ThemeA11yProvider>
    </React.Suspense>
  );
}
export default App;
