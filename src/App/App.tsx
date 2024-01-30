import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CopyrightModal,
  Footer,
  Header,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Loader from '../components/layout/Loader/Loader';
import LandingPage from '../pages/LandingPage/LandingPage';
import theme from '../services/theme/theme';

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 20;
const {REACT_APP_VERSION} = process.env;

function App() {
  const { t } = useTranslation('pht');
  const { themeMode } = storageObject.useStore();
  const [showCopyright, setShowCopyright] = React.useState(false);

  const skao = t('toolTip.button.skao');
  const mode = t('toolTip.button.mode');
  const toolTip = { skao, mode };

  return (
    <ThemeProvider theme={theme(themeMode.mode)}>
      <CssBaseline enableColorScheme />
      <React.Suspense fallback={<Loader />}>
        <CopyrightModal copyrightFunc={setShowCopyright} show={showCopyright} />
        <Header
          testId="headerId"
          title="Proposal Handling Tool"
          toolTip={toolTip}
          selectTelescope={false}
        />
        <>
          <Spacer size={HEADER_HEIGHT} axis={SPACER_VERTICAL} />
          <LandingPage />
          <Spacer size={FOOTER_HEIGHT} axis={SPACER_VERTICAL} />
        </>
        <Footer copyrightFunc={setShowCopyright} testId="footerId" version={REACT_APP_VERSION} />
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
