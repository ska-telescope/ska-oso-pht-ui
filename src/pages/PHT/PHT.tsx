import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertColorTypes,
  AppWrapper,
  THEME_DARK,
  THEME_LIGHT,
  ACCESSIBILITY_DEFAULT
  // ACCESSIBILITY_PROTANOPIA,
  // ACCESSIBILITY_PROTANOMALY,
  // ACCESSIBILITY_DEUTERANOPIA,
  // ACCESSIBILITY_DEUTERANOMALY,
  // ACCESSIBILITY_TRITANOPIA,
  // ACCESSIBILITY_TRITANOMALY,
  // ACCESSIBILITY_ACHROMATOMALY,
  // ACCESSIBILITY_ACHROMATOPSIA
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Typography, CssBaseline, ThemeProvider, Tooltip, Paper } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { cypressToken, NAV, PATH, PMT, REVIEW_TYPE, USE_LOCAL_DATA } from '../../utils/constants';
import packageJson from '../../../package.json';

// Pages
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
import PanelManagement from '../PanelManagement/PanelManagement';
import ReviewDashboard from '../ReviewDashboard/ReviewDashboard';
import PanelReviewDecisionList from '../PanelReviewDecisionList/PanelReviewDecisionList';
import ReviewEntry from '../entry/ReviewEntry/ReviewEntry';
import CalibrationPage from '../CalibrationPage/CalibrationPage';
import LinkingPage from '../LinkingPage/LinkingPage';
import Proposal from '@/utils/types/proposal';
import Notification from '@/utils/types/notification';
import ButtonUserMenu from '@/components/button/UserMenu/UserMenu';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import TimedAlert from '@/components/alerts/timedAlert/TimedAlert';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
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
  { path: NAV[8], element: <LinkingPage /> },
  { path: NAV[9], element: <CalibrationPage /> },
  { path: NAV[10], element: <SrcDataPage /> },
  { path: PATH[1], element: <AddProposal /> },
  { path: PATH[2], element: <ObservationEntry /> },
  { path: PATH[3], element: <AddDataProduct /> },
  { path: PMT[0], element: <PanelManagement /> },
  { path: PMT[1], element: <ReviewListPage /> },
  { path: PMT[2], element: <ReviewDashboard /> },
  { path: PMT[3], element: null },
  { path: PMT[4], element: <PanelReviewDecisionList /> },
  { path: PMT[5], element: <ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} /> },
  { path: PMT[6], element: <ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} /> }
];

export default function PHT() {
  const { t } = useScopedTranslation();
  const { application, help, helpToggle } = storageObject.useStore();
  const { osdCloses, osdCountdown, osdCycleId, osdCycleDescription, osdOpens } = useOSDAccessors();
  const navigate = useNavigate();
  const location = useLocation();

  const [themeMode, setThemeMode] = React.useState(
    localStorage.getItem('skao_theme_mode') === THEME_DARK ? THEME_DARK : THEME_LIGHT
  );
  const [accessibilityMode] = React.useState(
    localStorage.getItem('skao_accessibility_mode') || ACCESSIBILITY_DEFAULT
  );
  const [apiVersion] = React.useState('2.2.0');

  const muiTheme = theme({ themeMode, accessibilityMode });

  const LG = () => useMediaQuery(muiTheme.breakpoints.down('lg'));
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';
  const loggedIn = isLoggedIn();

  React.useEffect(() => {
    if (location.pathname !== '/') {
      navigate(PATH[0]);
    }
  }, []);

  const getProposal = () => application.content2 as Proposal;

  const mediaSizeNotSupported = () => (
    <Alert color={AlertColorTypes.Error} text={t('mediaSize.notSupported')} testId="helpPanelId" />
  );

  const modeToggle = () => {
    const newMode = themeMode === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('skao_theme_mode', newMode);
    setThemeMode(newMode);
  };

  const signIn = () => <ButtonUserMenu />;

  const showNotification = () => {
    const note = application.content5 as Notification;
    return note?.message?.length > 0 && note?.level !== AlertColorTypes.Error;
  };

  const footerMainChildren = () => {
    const opt1 = !showNotification() && (loggedIn || cypressToken) && getProposal()?.id?.length;
    const opt2 = showNotification();
    if (!opt1 && !opt2) return null;
    return (
      <>
        {opt1 && (
          <Tooltip
            title={
              <>
                <div>
                  <strong>Cycle:</strong> {osdCycleId}
                </div>
                <div>
                  <strong>Description:</strong> {osdCycleDescription}
                </div>
                <div>
                  <strong>Opens:</strong> {osdOpens(true)}
                </div>
                <div>
                  <strong>Closes:</strong> {osdCloses(true)}
                </div>
              </>
            }
            arrow
            placement="top"
          >
            <Typography pt={1} variant="body1">
              {osdCountdown}
            </Typography>
          </Tooltip>
        )}
        {opt2 && (
          <TimedAlert
            color={(application.content5 as Notification)?.level}
            gap={0}
            delay={(application.content5 as Notification)?.delay}
            testId="timeAlertFooter"
            text={(application.content5 as Notification)?.message}
          />
        )}
      </>
    );
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <AppWrapper
        application={t(LG() ? 'pht.short' : 'pht.title')}
        footerChildren={
          <Typography pt={1} variant="body1">
            {loggedIn || cypressToken ? getProposal()?.id : ''}
            {LOCAL_DATA}
          </Typography>
        }
        footerChildrenMiddle={footerMainChildren()}
        headerChildren={null}
        iconDocsToolTip={t('toolTip.button.docs')}
        iconDocsURL={t('toolTip.button.docsURL', { version: packageJson.version })}
        iconFeedbackToolTip={''}
        iconFeedbackURL={''}
        loginComponent={signIn()}
        mainChildren={
          <Paper
            sx={{
              backgroundColor: 'background.default',
              borderRadius: '0px',
              minHeight: '91vh'
            }}
          >
            {REQUIRED_WIDTH ? (
              <Routes>
                {ROUTES.map((ROUTE, index) => (
                  <Route key={index} path={ROUTE.path} element={ROUTE.element} />
                ))}
              </Routes>
            ) : (
              mediaSizeNotSupported()
            )}
          </Paper>
        }
        selectTelescope={false}
        storageHelp={help}
        storageHelpToggle={helpToggle}
        storageThemeMode={themeMode}
        storageToggleTheme={modeToggle}
        version={packageJson.version}
        versionTooltip={t('apiVersion.label') + ' : ' + apiVersion}
      />
    </ThemeProvider>
  );
}
