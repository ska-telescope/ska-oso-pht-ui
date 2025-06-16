import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  AlertColorTypes,
  AppWrapper,
  THEME_DARK,
  THEME_LIGHT
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { MenuItem, Divider, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { NAV, PATH, PMT, USE_LOCAL_DATA } from '../../utils/constants';
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
import ReviewPage from '../ReviewPage/ReviewPage';
import packageJson from '../../../package.json';
import PanelMaintenance from '../PanelMaintenance/PanelMaintenance';
import ReviewDashboard from '../ReviewDashboard/ReviewDashboard';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import { ButtonUserMenu } from '@/components/button/UserMenu/UserMenu';

// import getProposal from '@/services/axios/getProposal/getProposal';
import Proposal from '@/utils/types/proposal';

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
  { path: PMT[1], element: <ReviewPage /> },
  { path: PMT[2], element: <ReviewDashboard /> }
];

// declare const window: any;

export default function PHT() {
  const { t } = useTranslation('pht');
  const { application, help, helpToggle } = storageObject.useStore();
  const navigate = useNavigate();
  const [theMode, setTheMode] = React.useState(
    localStorage.getItem('skao_theme_mode') !== THEME_DARK ? THEME_LIGHT : THEME_DARK
  );
  const [apiVersion] = React.useState('2.2.0'); // TODO : Obtain real api version number

  const LG = () => useMediaQuery(useTheme().breakpoints.down('lg')); // Allows us to code depending upon screen size
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';

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

  const onMenuSelect = (thePath: string) => {
    navigate(thePath);
  };

  const signIn = () => (
    // TODO : This is totally mocked and will be replaced in time
    <ButtonUserMenu label={'MOCKED'} toolTip={'MOCKED tooltip'}>
      <MenuItem onClick={() => onMenuSelect(PMT[2])}>{t('menuOptions.overview')}</MenuItem>
      <MenuItem onClick={() => onMenuSelect(PATH[0])}>{t('menuOptions.proposals')}</MenuItem>
      <MenuItem disabled>{t('menuOptions.scienceVerification')}</MenuItem>
      <MenuItem onClick={() => onMenuSelect(PMT[0])}>{t('menuOptions.panelSummary')}</MenuItem>
      <MenuItem onClick={() => onMenuSelect(PMT[1])}>{t('menuOptions.reviews')}</MenuItem>
      <Divider component="li" />
      <MenuItem disabled> Logout</MenuItem>
    </ButtonUserMenu>
  );

  return (
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
      loginComponent={[signIn()]}
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
  );
}
