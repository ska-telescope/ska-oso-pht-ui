import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertColorTypes,
  AppWrapper,
  THEME_DARK,
  THEME_LIGHT
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Typography, useTheme, CssBaseline, ThemeProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { NAV, PATH, PMT, REVIEW_TYPE, USE_LOCAL_DATA } from '../../utils/constants';
import AddDataProduct from '../add/AddDataProduct/AddDataProduct';
import AddProposal from '../add/AddProposal/AddProposal';
import SdpDataPage from '../SdpDataPage/SdpDataPage';
import SrcDataPage from '../SrcDataPage/SrcDataPage';
import GeneralPage from '../GeneralPage/GeneralPage';
import ObservationEntry from '../entry/ObservationEntry/ObservationEntry';
import ObservationPage from '../ObservationPage/ObservationPage';
import SciencePage from '../SciencePage/SciencePage';
import TargetPage from '../TargetPage/TargetPage';
import TeamPage from '../TeamPage/TeamPage';
import TechnicalPage from '../TechnicalPage/TechnicalPage';
import TitlePage from '../TitlePage/TitlePage';
import LandingPage from '../LandingPage/LandingPage';
import ReviewListPage from '../ReviewListPage/ReviewListPage';
import packageJson from '../../../package.json';
import PanelMaintenance from '../PanelMaintenance/PanelMaintenance';
import ReviewDashboard from '../ReviewDashboard/ReviewDashboard';
import ReviewPanelEntry from '../entry/ReviewPanelEntry/ReviewPanelEntry';
import PanelReviewDecision from '../PanelReviewDecision/PanelReviewDecision';
import PanelReviewDecisionList from '../PanelReviewDecisionList/PanelReviewDecisionList';
import ReviewEntry from '../entry/ReviewEntry/ReviewEntry';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import ButtonUserMenu from '@/components/button/UserMenu/UserMenu';

// import getProposal from '@/services/axios/getProposal/getProposal';
import Proposal from '@/utils/types/proposal';
import theme from '@/services/theme/theme';

const ROUTES = [
  { path: PATH[0], element: <LandingPage /> },
  { path: NAV[0], element: <TitlePage /> },
  { path: NAV[1], element: <TeamPage /> },
  { path: NAV[2], element: <GeneralPage /> },
  { path: NAV[3], element: <SciencePage /> },
  { path: NAV[4], element: <TargetPage /> },
  { path: NAV[5], element: <ObservationPage /> },
  { path: NAV[6], element: <TechnicalPage /> },
  { path: NAV[7], element: <SdpDataPage /> },
  { path: NAV[8], element: <SrcDataPage /> },
  { path: PATH[1], element: <AddProposal /> },
  { path: PATH[2], element: <ObservationEntry /> },
  { path: PATH[3], element: <AddDataProduct /> },
  { path: PMT[0], element: <PanelMaintenance /> },
  { path: PMT[1], element: <ReviewListPage /> },
  { path: PMT[2], element: <ReviewDashboard /> },
  { path: PMT[3], element: <ReviewPanelEntry /> },
  { path: PMT[4], element: <PanelReviewDecisionList /> },
  { path: PMT[5], element: <ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} /> },
  { path: PMT[6], element: <PanelReviewDecision /> },
  { path: PMT[7], element: <ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} /> }
];

export default function PHT() {
  const { t } = useTranslation('pht');
  const { application, help, helpToggle } = storageObject.useStore();
  const theTheme = useTheme();
  const navigate = useNavigate();
  const [theMode, setTheMode] = React.useState(
    localStorage.getItem('skao_theme_mode') !== THEME_DARK ? THEME_LIGHT : THEME_DARK
  );
  const [apiVersion] = React.useState('2.2.0'); // TODO : Obtain real api version number

  const LG = () => useMediaQuery(theTheme.breakpoints.down('lg')); // Allows us to code depending upon screen size
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';
  const location = useLocation();
  React.useEffect(() => {
    if (location.pathname !== '/') {
      navigate(PATH[0]);
    }
  }, []);

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

  const modeToggle = () => {
    const newMode = theMode === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('skao_theme_mode', newMode);
    setTheMode(newMode);
  };

  const signIn = () => <ButtonUserMenu />;

  return (
    <ThemeProvider theme={theme(theMode)}>
      <CssBaseline enableColorScheme />
      <AppWrapper
        application={t(LG() ? 'pht.short' : 'pht.title')}
        footerChildren={
          <Typography pt={1} variant="body1">
            {getProposal()?.id}
            {LOCAL_DATA}
          </Typography>
        }
        headerChildren={null}
        iconDocsToolTip={t('toolTip.button.docs')}
        iconDocsURL={t('toolTip.button.docsURL', { version: packageJson.version })}
        loginComponent={signIn()}
        mainChildren={
          <>
            {REQUIRED_WIDTH && (
              <Routes>
                {ROUTES.map((ROUTE, index) => {
                  return <Route key={index} path={ROUTE.path} element={ROUTE.element} />;
                })}
              </Routes>
            )}
            {!REQUIRED_WIDTH && mediaSizeNotSupported()}
          </>
        }
        selectTelescope={false}
        storageHelp={help}
        storageHelpToggle={helpToggle}
        storageThemeMode={theMode}
        storageToggleTheme={modeToggle}
        version={packageJson.version}
        versionTooltip={t('apiVersion.label') + ' : ' + apiVersion}
      />
    </ThemeProvider>
  );
}
