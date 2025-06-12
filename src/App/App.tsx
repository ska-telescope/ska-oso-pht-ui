import React from 'react';
import { useTranslation } from 'react-i18next';
import { CssBaseline, Divider, MenuItem, ThemeProvider, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AlertColorTypes,
  AppWrapper,
  THEME_DARK,
  THEME_LIGHT
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Alert from '../components/alerts/standardAlert/StandardAlert';
import Loader from '../components/layout/Loader/Loader';
import PHT from '../pages/PHT/PHT';
import theme from '../services/theme/theme.tsx';
import { USE_LOCAL_DATA } from '../utils/constants';
import Proposal from '../utils/types/proposal';
import packageJson from '../../package.json';
import { ButtonUserMenu } from '@/components/button/UserMenu/UserMenu.tsx';

function App() {
  const { t } = useTranslation('pht');
  const { application, help, helpToggle } = storageObject.useStore();
  const [theMode, setTheMode] = React.useState(
    localStorage.getItem('skao_theme_mode') !== THEME_DARK ? THEME_LIGHT : THEME_DARK
  );
  const [apiVersion] = React.useState('2.2.0'); // TODO : Obtain real api version number

  const LG = () => useMediaQuery(useTheme().breakpoints.down('lg')); // Allows us to code depending upon screen size
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';

  const modeToggle = () => {
    const newMode = theMode === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('skao_theme_mode', newMode);
    setTheMode(newMode);
  };

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

  const signIn = () => (
    // TODO : This is totally mocked and will be replaced in time
    <ButtonUserMenu label={'MOCKED'} toolTip={'MOCKED tooltip'}>
      <MenuItem disabled>{t('menuOptions.overview')}</MenuItem>
      <MenuItem disabled>{t('menuOptions.proposals')}</MenuItem>
      <MenuItem disabled>{t('menuOptions.scienceVerification')}</MenuItem>
      <MenuItem disabled>{t('menuOptions.panelSummary')}</MenuItem>
      <MenuItem disabled>{t('menuOptions.reviews')}</MenuItem>
      <Divider component="li" />
      <MenuItem disabled> Logout</MenuItem>
    </ButtonUserMenu>
  );

  return (
    <ThemeProvider theme={theme(theMode)}>
      <CssBaseline enableColorScheme />
      <React.Suspense fallback={<Loader />}>
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
              {REQUIRED_WIDTH && <PHT />}
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
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
