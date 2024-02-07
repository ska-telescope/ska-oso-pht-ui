import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CssBaseline, ThemeProvider, Typography } from '@mui/material';
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
import AddProposal from '../pages/AddProposal/AddProposal';
import AddObservation from '../pages/AddObservation/AddObservation';
import TitlePage from '../pages/TitlePage/TitlePage';
import TeamPage from '../pages/TeamPage/TeamPage';
import GeneralPage from '../pages/GeneralPage/GeneralPage';
import SciencePage from '../pages/SciencePage/SciencePage';
import TargetPage from '../pages/TargetPage/TargetPage';
import ObservationPage from '../pages/ObservationPage/ObservationPage';
import TechnicalPage from '../pages/TechnicalPage/TechnicalPage';
import DataPage from '../pages/DataPage/DataPage';
import theme from '../services/theme/theme';
import { NAV, USE_LOCAL_DATA } from '../utils/constants';

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 20;

function App() {
  const { t } = useTranslation('pht');
  const { themeMode } = storageObject.useStore();
  const [showCopyright, setShowCopyright] = React.useState(false);
  const [apiVersion] = React.useState('0.0.1'); // TODO : Obtain real api version number

  const skao = t('toolTip.button.skao');
  const mode = t('toolTip.button.mode');
  const toolTip = { skao, mode };
  const REACT_APP_VERSION = process.env.REACT_APP_VERSION;
  const LOCAL_DATA = USE_LOCAL_DATA ? 'LOCAL DATA' : '';

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
          <Router>
            <Routes>
              <Route path="/" element={<PHT />} />
              <Route path={NAV[0]} element={<TitlePage />} />
              <Route path={NAV[1]} element={<TeamPage />} />
              <Route path={NAV[2]} element={<GeneralPage />} />
              <Route path={NAV[3]} element={<SciencePage />} />
              <Route path={NAV[4]} element={<TargetPage />} />
              <Route path={NAV[5]} element={<ObservationPage />} />
              <Route path={NAV[6]} element={<TechnicalPage />} />
              <Route path={NAV[7]} element={<DataPage />} />
              <Route path="/addProposal" element={<AddProposal />} />
              <Route path="/addObservation" element={<AddObservation />} />
            </Routes>
          </Router>
          <Spacer size={FOOTER_HEIGHT} axis={SPACER_VERTICAL} />
        </>
        <Footer
          copyrightFunc={setShowCopyright}
          testId="footerId"
          version={REACT_APP_VERSION}
          versionTooltip={t('apiVersion.label') + ' : ' + apiVersion}
        >
          <Typography pt={1} variant="body1">
            {LOCAL_DATA}
          </Typography>
          <Typography variant="body1"></Typography>
        </Footer>
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
