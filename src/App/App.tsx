import React from 'react';
import { useTranslation } from 'react-i18next';
import { CssBaseline, ThemeProvider, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AlertColorTypes, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AuthWrapper } from '@ska-telescope/ska-login-page';
import Alert from '../components/alerts/standardAlert/StandardAlert';
import Loader from '../components/layout/Loader/Loader';
import PHT from '../pages/PHT/PHT';
import theme from '../services/theme/theme';
import { USE_LOCAL_DATA } from '../utils/constants';
import Proposal from '../utils/types/proposal';

// TODO : Need to do a clean up once we are happy with the AAA additions

function App() {
  const { t } = useTranslation('pht');
  const { helpToggle } = storageObject.useStore();
  const [theMode, setTheMode] = React.useState(
    localStorage.getItem('skao_theme_mode') !== THEME_DARK ? THEME_LIGHT : THEME_DARK
  );
  const [apiVersion] = React.useState('2.2.0'); // TODO : Obtain real api version number

  const LG = () => useMediaQuery(useTheme().breakpoints.down('lg')); // Allows us to code depending upon screen size
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');

  const REACT_APP_VERSION = process.env.REACT_APP_VERSION;
  const LOCAL_DATA = USE_LOCAL_DATA ? t('localData') : '';

  const modeToggle = () => {
    const newMode = theMode === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('skao_theme_mode', newMode);
    setTheMode(newMode);
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
    <ThemeProvider theme={theme(theMode)}>
      <CssBaseline enableColorScheme />
      <React.Suspense fallback={<Loader />}>
        <AuthWrapper
          application={t(LG() ? 'pht.short' : 'pht.title')}
          buttonLoginLabel={t('buttonSignIn.label', { ns: 'authentication' })}
          buttonLoginToolTip={t('buttonSignIn.toolTip', { ns: 'authentication' })}
          buttonLogoutLabel={t('buttonSignOut.label', { ns: 'authentication' })}
          buttonLogoutToolTip={t('buttonSignOut.toolTip', { ns: 'authentication' })}
          buttonUserMenu
          buttonUserShowPhoto
          buttonUserShowUsername
          buttonUserToolTip={t('buttonUser.toolTip', { ns: 'authentication' })}
          iconDocsToolTip={t('iconDocs.toolTip')}
          iconDocsURL={t('iconDocs.url', { version: REACT_APP_VERSION })}
          mainChildren={
            <>
              {REQUIRED_WIDTH && <PHT />}
              {!REQUIRED_WIDTH && mediaSizeNotSupported()}
            </>
          }
          footerChildren={[
            <Typography pt={1} variant="body1">
              {getProposal()?.id}
              {LOCAL_DATA}
            </Typography>
          ]}
          iconSKAOToolTip={t('iconSKAO.toolTip')}
          iconThemeToolTip={t('iconTheme.toolTip')}
          // storageHelp={help}
          storageHelpToggle={helpToggle}
          storageThemeMode={theMode}
          storageToggleTheme={modeToggle}
          version={REACT_APP_VERSION}
          versionTooltip={t('apiVersion.label') + ' : ' + apiVersion}
        />
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
