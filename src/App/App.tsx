import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { NAV } from '../utils/constants';

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
        <Footer copyrightFunc={setShowCopyright} testId="footerId" version={version} />
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
