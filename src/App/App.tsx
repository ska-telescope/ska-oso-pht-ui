import React from 'react';
import { useTranslation } from 'react-i18next';
import { CssBaseline, ThemeProvider } from '@mui/material';
import {
  CopyrightModal,
  Footer,
  Header,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Loader from '../components/layout/Loader/Loader';
import PHT from '../pages/PHT/PHT';
import theme from '../services/theme/theme';

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 20;

function App() {
  const { t } = useTranslation('pht');
  const { themeMode } = storageObject.useStore();
  const [showCopyright, setShowCopyright] = React.useState(false);

  const skao = t('toolTip.button.skao');
  const mode = t('toolTip.button.mode');
  const toolTip = { skao, mode };
  const version = process.env.VERSION;

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
          <PHT />
          <Spacer size={FOOTER_HEIGHT} axis={SPACER_VERTICAL} />
        </>
        <Footer copyrightFunc={setShowCopyright} testId="footerId" version={version} />
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
