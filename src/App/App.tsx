import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Loader from '@components/layout/Loader/Loader';
import PHT from '@/pages/PHT/PHT';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { GetColorsProvider } from '@/utils/colors/colorsContext';

declare const window: any;

function App() {
  return (
    <React.Suspense fallback={<Loader />}>
      <ThemeA11yProvider>
        <GetColorsProvider>
          <Router basename={window?.env?.REACT_APP_SKA_PHT_BASE_URL || '/'}>
            <PHT />
          </Router>
        </GetColorsProvider>
      </ThemeA11yProvider>
    </React.Suspense>
  );
}

export default App;
