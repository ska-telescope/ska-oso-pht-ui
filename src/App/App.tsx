import React from 'react';
import { useTranslation } from 'react-i18next';
import { CssBaseline, ThemeProvider, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AlertColorTypes,
  CopyrightModal,
  Footer,
  Header,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Alert from '../components/alerts/standardAlert/StandardAlert';
import Loader from '../components/layout/Loader/Loader';
import PHT from '../pages/PHT/PHT';
import theme from '../services/theme/theme';
import { USE_LOCAL_DATA } from '../utils/constants';
import Proposal from '../utils/types/proposal';

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 20;

function App() {
  const { t } = useTranslation('pht');
  const {
    help,
    helpToggle,
    telescope,
    themeMode,
    toggleTheme,
    updateTelescope
  } = storageObject.useStore();
  const [showCopyright, setShowCopyright] = React.useState(false);
  const [apiVersion] = React.useState('2.1.0'); // TODO : Obtain real api version number

  const LG = () => useMediaQuery(useTheme().breakpoints.down('lg')); // Allows us to code depending upon screen size
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');

  const skao = t('toolTip.button.skao');
  const mode = t('toolTip.button.mode');
  const headerTip = t('toolTip.button.docs');
  const headerURL = t('toolTip.button.docsURL');
  const docs = { tooltip: headerTip, url: headerURL };
  const toolTip = { skao, mode };
  const REACT_APP_VERSION = process.env.REACT_APP_VERSION;
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';
  const theStorage = {
    help: help,
    helpToggle: helpToggle,
    telescope: telescope,
    themeMode: themeMode.mode,
    toggleTheme: toggleTheme,
    updateTelescope: updateTelescope
  };

  const { application } = storageObject.useStore();
  const getProposal = () => application.content2 as Proposal;

  const mediaSizeNotSupported = () => {
    return (
      <Alert
        color={AlertColorTypes.Error}
        text={t('mediaSize.notSupported')}
        testId="helpPanelId"
      />
    );
  };

  return (
    <ThemeProvider theme={theme(themeMode.mode)}>
      <CssBaseline enableColorScheme />
      <React.Suspense fallback={<Loader />}>
        <CopyrightModal copyrightFunc={setShowCopyright} show={showCopyright} />
        <Header
          docs={docs}
          testId="headerId"
          title={t(LG() ? 'pht.short' : 'pht.title')}
          toolTip={toolTip}
          selectTelescope={false}
          storage={theStorage}
        />
        <>
          <Spacer size={HEADER_HEIGHT} axis={SPACER_VERTICAL} />
          {REQUIRED_WIDTH && <PHT />}
          {!REQUIRED_WIDTH && mediaSizeNotSupported()}
          <Spacer size={FOOTER_HEIGHT} axis={SPACER_VERTICAL} />
        </>
        <Footer
          copyrightFunc={setShowCopyright}
          testId="footerId"
          version={REACT_APP_VERSION}
          versionTooltip={t('apiVersion.label') + ' : ' + apiVersion}
        >
          <Typography pt={1} variant="body1">
            {getProposal()?.id}
            {LOCAL_DATA}
          </Typography>
          <Typography variant="body1"></Typography>
        </Footer>
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
