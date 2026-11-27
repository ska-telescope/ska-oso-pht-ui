import React from 'react';
import Target from '@/utils/types/target';
import { Routes, Route, useLocation, useNavigate } from 'react-router';
import {
  AlertColorTypes,
  AppWrapper,
  SKABrandColor,
  THEME_DARK,
  THEME_LIGHT
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@utils/storage/store';
import { Typography, CssBaseline, Tooltip, Paper, Grid } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  FOOTER_HEIGHT_PHT,
  NAV,
  PATH,
  PMT,
  PROPOSAL_STATUS,
  REVIEW_TYPE,
  SKA_OSO_SERVICES_URL,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  PAGE_CALIBRATION_ENTRY,
  PAGE_OBSERVATION_ENTRY
} from '@utils/constants.ts';
import packageJson from '../../../package.json';

// Pages...
import AddDataProduct from '../add/AddDataProduct/AddDataProduct';
import AddProposal from '../add/AddProposal/AddProposal';
import DataProductPage from '../DataProduct/DataProductPage';
import DetailsPage from '../DetailsPage/DetailsPage';
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
import CalibrationEntry from '../entry/Calibration/CalibrationEntry';
import Notification from '@/utils/types/notification';
import { saveValuesToOda } from '@/models/proposals/useProposalOda';
import ButtonUserMenu from '@/components/button/UserMenu/UserMenu';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import TimedAlert from '@/components/alerts/timedAlert/TimedAlert';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import { linkTarget } from '@/utils/autoLinking/AutoLinking';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import useAxiosInterceptor from '@/services/axios/useAxiosInterceptor/useAxiosInterceptor';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { getProposalFormDefaults, useProposalForm } from '@/models/proposals/useProposalForm';
import { useProposalDraftStorage } from '@/models/proposals/useProposalDraftStorage';
import { FormProvider, useWatch } from 'react-hook-form';
import { SensitivityService } from '@/services/sensitivityCalculator/useSensitivityService';

// The height AppWrapper leaves above the page for its fixed header (its SPACER_HEADER)
const HEADER_HEIGHT = 70;

const ROUTES = [
  { path: PATH[0], element: <LandingPage /> },
  { path: NAV[0], element: <TitlePage /> },
  { path: NAV[1], element: <TeamPage /> },
  { path: NAV[2], element: <DetailsPage /> },
  { path: NAV[3], element: <SciencePage /> },
  { path: NAV[4], element: <TargetPage /> },
  { path: NAV[5], element: <ObservationPage /> },
  { path: NAV[6], element: <TechnicalPage /> },
  { path: NAV[7], element: <DataProductPage /> },
  { path: NAV[8], element: <LinkingPage /> },
  { path: NAV[9], element: <CalibrationPage /> },
  { path: PATH[1], element: <AddProposal /> },
  { path: PATH[PAGE_OBSERVATION_ENTRY], element: <ObservationEntry /> },
  { path: PATH[3], element: <AddDataProduct /> },
  { path: PMT[0], element: <PanelManagement /> },
  { path: PMT[1], element: <ReviewListPage /> },
  { path: PMT[2], element: <ReviewDashboard /> },
  { path: PMT[3], element: <div /> },
  { path: PMT[4], element: <PanelReviewDecisionList /> },
  { path: PMT[5], element: <ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} /> },
  { path: PMT[6], element: <ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} /> },
  { path: PATH[PAGE_CALIBRATION_ENTRY], element: <CalibrationEntry /> }
];

// The pages that work on the open proposal: the proposal pages, the new-proposal page and the
// entry pages for observations, data products and calibration
const isEditorPath = (path: string) =>
  NAV.includes(path) || [PATH[1], PATH[2], PATH[3], PATH[4], PATH[5]].includes(path);

interface PHTPropTypes {
  themeMode: string;
  setThemeMode: (mode: string) => void;
  accessibilityMode: number;
  setAccessibilityMode: (mode: number) => void;
  buttonVariant: string;
  setButtonVariant: (mode: string) => void;
  flatten: boolean;
  setFlatten: (mode: boolean) => void;
}

export default function PHT({
  themeMode,
  setThemeMode,
  accessibilityMode,
  setAccessibilityMode,
  buttonVariant,
  setButtonVariant,
  flatten,
  setFlatten
}: PHTPropTypes) {
  const { t } = useScopedTranslation();
  const { application, help, helpToggle } = storageObject.useStore();
  const {
    autoLink,
    osdCloses,
    osdCountdown,
    osdCycleId,
    osdCycleDescription,
    osdLOW,
    osdMID,
    osdOpens
  } = useOSDAccessors();
  const navigate = useNavigate();
  const location = useLocation();
  const { axiosClient: authClient } = useAxiosAuthClient();
  useAxiosInterceptor();
  const { setHelp } = useHelp();
  const { notifyError } = useNotify();
  const theme = useTheme();
  const previousPathRef = React.useRef(location.pathname);

  const belowLg = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const REQUIRED_WIDTH = useMediaQuery('(min-width:600px)');

  React.useEffect(() => {
    if (location.pathname !== '/') {
      navigate(PATH[0]);
    }
  }, []);

  React.useEffect(() => {
    setHelp('helpText.notAvailable');
  }, [navigate]);

  const autoRepairAttemptedForIdRef = React.useRef<string | undefined>(undefined);

  const formMethods = useProposalForm({ low: osdLOW, mid: osdMID });
  useProposalDraftStorage(formMethods);
  const { getValues, reset } = formMethods;
  const prslId = useWatch({ control: formMethods.control, name: 'prslId' });
  // The pages that edit the proposal open in the form, outside which it isn't shown: the
  // proposal pages and the entry pages for observations, data products and calibration
  const isEditing =
    NAV.includes(location.pathname) ||
    [PATH[2], PATH[3], PATH[4], PATH[5]].includes(location.pathname);

  // A target can end up linked with no matching targetObservation entry (e.g. an older
  // proposal affected by a past subarray-mapping bug), leaving the Observation page stuck on
  // "no observation" with no way to recover. Runs once per loaded proposal, regardless of which
  // page the user lands on first - re-running the same auto-link route used when a target is
  // first added. autoLink depends on OSD/cycle-policy data that may not have resolved yet when
  // the proposal is fetched, so this does not latch until autoLink actually becomes true.
  React.useEffect(() => {
    const target = formMethods.getValues('targets')?.[0] as Target | undefined;
    if (
      !prslId ||
      autoRepairAttemptedForIdRef.current === prslId ||
      !autoLink ||
      !target ||
      (formMethods.getValues('targetObservation')?.length ?? 0) > 0
    ) {
      return;
    }
    autoRepairAttemptedForIdRef.current = prslId;
    void linkTarget(
      target,
      formMethods,
      authClient,
      osdLOW?.basicCapabilities?.minElevationDeg ?? null
    );
  }, [prslId, autoLink]);

  React.useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    if (previousPath === currentPath) {
      return;
    }

    const isProposalPageTransition =
      NAV.includes(previousPath) && (NAV.includes(currentPath) || currentPath === PATH[0]);
    if (isProposalPageTransition) {
      const values = getValues();
      void (async () => {
        const { error } = await saveValuesToOda(values, PROPOSAL_STATUS.DRAFT);
        if (error) {
          notifyError(error);
        }
      })();
    }

    // Leaving the editor (for the landing page or PMT) closes the proposal. The values for the
    // save above are taken first. This runs after the new page's own effects, so the reset can't
    // be done by that page.
    if (!isEditorPath(currentPath)) {
      reset(getProposalFormDefaults());
    }

    previousPathRef.current = currentPath;
  }, [location.pathname, notifyError, getValues, reset]);

  const mediaSizeNotSupported = () => (
    <Alert color={AlertColorTypes.Error} text={t('mediaSize.notSupported')} testId="helpPanelId" />
  );

  const themeToggle = () => {
    const newMode = themeMode === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('skao_theme_mode', newMode);
    setThemeMode(newMode);
  };

  const accessibilityUpdate = (inValue: number) => {
    localStorage.setItem('skao_accessibility_mode', String(inValue));
    setAccessibilityMode(inValue);
  };

  const variantToggle = () => {
    const newValue = buttonVariant === SKABrandColor.Blue ? SKABrandColor.Pink : SKABrandColor.Blue;
    localStorage.setItem('skao_button_variant', newValue);
    setButtonVariant(newValue);
  };

  const signIn = () => <ButtonUserMenu />;

  const hasNotification = () => {
    const note = application.content5 as Notification;
    return note?.message?.length > 0;
  };

  const showNotification = () => {
    const note = application.content5 as Notification;
    return note?.message?.length > 0 && note?.level !== AlertColorTypes.Error;
  };

  const footerNotification = () => {
    if (!hasNotification()) return null;
    const notification = application.content5 as Notification;
    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.snackbar,
          pointerEvents: 'none'
        }}
        elevation={0}
      >
        <Grid
          container
          sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}
        >
          <Grid sx={{ pointerEvents: 'auto' }}>
            <TimedAlert
              color={notification?.level}
              delay={notification?.delay}
              testId="timeAlertFooter"
              text={notification?.message}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const headerCountdown = () => {
    const opt1 = !showNotification() && isEditing;

    if (!opt1) return null;
    return (
      <div>
        {opt1 && (
          <Tooltip
            title={
              <div>
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
              </div>
            }
            arrow
            placement="top"
          >
            <Typography
              variant="body1"
              sx={{
                pt: 1
              }}
            >
              {osdCountdown}
            </Typography>
          </Tooltip>
        )}
      </div>
    );
  };

  const versionToolTip = () => {
    const tmp1 = SKA_OSO_SERVICES_URL?.split('/') ?? [];
    const tmp2 = SKA_SENSITIVITY_CALCULATOR_API_URL?.split('/') ?? [];
    const apiVersion = tmp1.length > 0 ? tmp1[tmp1.length - 1] : 'N/A';
    const sensCalcVersion = tmp2.length > 1 ? tmp2[tmp2.length - 2] : 'N/A';
    return (
      t('apiVersion.label') +
      ' : ' +
      apiVersion +
      ' | ' +
      t('apiVersion.sensCalc') +
      ' : ' +
      sensCalcVersion
    );
  };

  // NOTE: This is the place to limit the color options that can be seen.
  //       For all options, you can return an empty list
  const getAccessibilityColors = () => {
    return [
      'telescope',
      'chart',
      'logo',
      'reviewStatus',
      'proposalStatus',
      'observationType',
      'boolean',
      'button',
      'sbStatus',
      'status'
    ];
  };

  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AppWrapper
        accessibility
        accessibilityColor={getAccessibilityColors()}
        application={t(belowLg ? 'pht.short' : 'pht.title')}
        footerChildren={
          <Typography
            variant="body1"
            sx={{
              pt: 1
            }}
          >
            {isEditing ? `Submission ID: ${prslId}` : ''}
          </Typography>
        }
        headerChildren={headerCountdown()}
        iconDocsLabel={t('docs.label')}
        iconDocsToolTip={t('docs.toolTip')}
        iconDocsURL={t('docs.URL', { version: packageJson.version })}
        iconSensCalcURL={t('sensCalc.url')}
        iconSensCalcToolTip={t('sensCalc.tooltip')}
        iconSensCalcLabel={t('sensCalc.headerLabel')}
        iconFeedbackLabel={''}
        iconFeedbackToolTip={''}
        iconFeedbackURL={''}
        loginComponent={signIn()}
        mainChildren={
          <Paper
            sx={{
              backgroundColor: 'background.default',
              borderRadius: '0px',
              border: '0px solid transparent',
              // Down to the bottom of the window, below the header
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`
            }}
          >
            {/* TODO: REMOVE  */}
            {/* Global form provider for proposal form management */}
            <FormProvider {...formMethods}>
              <SensitivityService />
              {REQUIRED_WIDTH ? (
                <Routes>
                  {ROUTES.map((ROUTE) => (
                    <Route key={ROUTE.path} path={ROUTE.path} element={ROUTE.element} />
                  ))}
                </Routes>
              ) : (
                mediaSizeNotSupported()
              )}
            </FormProvider>
          </Paper>
        }
        selectTelescope={false}
        storageAccessibility={accessibilityMode}
        storageAccessibilityUpdate={accessibilityUpdate}
        storageHelp={help}
        storageColorLabel={t('colors.label')}
        storageHelpLabel={t('help')}
        storageHelpToggle={helpToggle}
        storageThemeMode={themeMode}
        storageToggleTheme={themeToggle}
        storageButtonVariant={buttonVariant}
        storageSetButtonVariant={variantToggle}
        storageFlatten={flatten}
        storageSetFlatten={setFlatten}
        version={packageJson.version}
        versionTooltip={versionToolTip()}
      />
      {footerNotification()}
    </CssVarsProvider>
  );
}
