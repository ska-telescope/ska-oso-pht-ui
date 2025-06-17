import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Loader from '@components/layout/Loader/Loader';
import PHT from '@/pages/PHT/PHT';

declare const window: any;

function App() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Router basename={window?.env?.REACT_APP_SKA_PHT_BASE_URL || '/'}>
        <PHT />
      </Router>
    </React.Suspense>
  );
}

export default App;
