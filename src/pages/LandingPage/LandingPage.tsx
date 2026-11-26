import React from 'react';
import { Entity, mintSkuid } from '@ska-telescope/skuid';
import { ButtonLogin, isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@utils/storage/store';
import {
  AlertColorTypes,
  BorderedSection,
  DropDown,
  SearchEntry,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import AddButton from '@/components/button/Add/Add';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import { useProposalOda } from '@/models/proposals/useProposalOda';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { UNKNOWN_API_ERROR } from '@/services/axios/apiResult/apiResult';
import { ProposalType } from '@/models/proposals/proposal';
import GetProposalList from '@/services/axios/get/getProposalList/getProposalList';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalAccessForUser from '@/services/axios/get/getProposalAccess/user/getProposalAccessForUser';
import Proposal from '@/utils/types/proposal';
import { useValidateProposal } from '@/utils/validation/validation';
import {
  EMPTY_STATUS,
  FOOTER_HEIGHT_PHT,
  FOOTER_SPACER,
  NAV,
  PAGE_LANDING,
  PATH,
  PROPOSAL_STATUS_OPTIONS,
  PROPOSAL_TYPE
} from '@/utils/constants';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import CycleSelection from '@/components/alerts/cycleSelection/CycleSelection';
import { useNotify } from '@/utils/notify/useNotify';
import { isSVPolicy, useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { ObservatoryPolicy } from '@/utils/types/observatoryData';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAPI } from '@/services/axios/use/useOSDAPI/useOSDAPI';
import TableSubmissions from '@/components/table/tableSubmissions/TableSubmissions';
import SensCalcButton from '@/components/button/SensCalc/SensCalc';

export default function LandingPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();
  const { osdCycleId, setSelectedPolicyByCycleId } = useOSDAccessors();
  const validateProposal = useValidateProposal();
  const { reset, getValues, control } = useFormContext<ProposalType>();
  // The proposal the dialogs show, which getTheProposal loads into the form
  const proposal = useWatch({ control }) as ProposalType;
  const theme = useTheme();

  const { application, updateAppContent1, updateAppContent4, updateAppContent5 } =
    storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [openCloneDialog, setOpenCloneDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [openCycleDialog, setOpenCycleDialog] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const loggedIn = isLoggedIn();
  const setAccess = (access: ProposalAccess[]) => updateAppContent4(access);
  const { setHelp } = useHelp();
  useOSDAPI(setAxiosError, Boolean(loggedIn));

  const { axiosClient: authClient } = useAxiosAuthClient();
  const { loadFromOda, createInOda } = useProposalOda();

  const pageMounted = React.useRef(true);
  React.useEffect(() => {
    pageMounted.current = true;
    return () => {
      pageMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      setProposals([]);

      /* c8 ignore start */
      const noLoginTest = window.localStorage.getItem('proposal:noLogin') === 'true';
      if (noLoginTest) {
        return;
      }
      /* c8 ignore end */
      if (!loggedIn) return;

      const response = await GetProposalList(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals(response);
      }
    };
    const fetchAccess = async () => {
      setProposals([]);
      if (!loggedIn) return;

      const response = await GetProposalAccessForUser(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setAccess(response);
      }
    };
    fetchData();
    fetchAccess();
  }, [fetchList, loggedIn]);

  React.useEffect(() => {
    if (loggedIn) {
      setFetchList(!fetchList);
    }
  }, []);

  const getTheProposal = async (id: string) => {
    setHelp('');
    updateAppContent5({});
    setAxiosViewError('');

    const response = await loadFromOda(id, () => pageMounted.current);
    if (response === null || !pageMounted.current) return false;

    const { data: values, error } = response;
    if (!values) {
      updateAppContent1({});
      setAxiosViewError(error ?? UNKNOWN_API_ERROR);
      return false;
    }
    setSelectedPolicyByCycleId(values.cycle);
    updateAppContent1(validateProposal(values));
    return true;
  };

  const goToTitlePage = () => {
    navigate(NAV[0]);
  };

  const proposalLoadPending = React.useRef(false);

  const openProposal = async (id: string, onSuccess: () => void) => {
    if (proposalLoadPending.current) return;

    proposalLoadPending.current = true;
    try {
      const loaded = await getTheProposal(id);
      if (!pageMounted.current) return;

      if (loaded) {
        onSuccess();
      } else {
        alert(t('error.iconClicked'));
      }
    } finally {
      proposalLoadPending.current = false;
    }
  };

  const viewIconClicked = (id: string) => openProposal(id, () => setOpenViewDialog(true));

  const editIconClicked = (id: string) => {
    if (!loggedIn) return;

    return openProposal(id, () => {
      window.scrollTo(0, 0);
      goToTitlePage();
    });
  };

  const cloneIconClicked = (id: string) => openProposal(id, () => setOpenCloneDialog(true));

  // The clone is made from the original, which getTheProposal loaded into the form. It keeps the
  // original's content and links; PostProposal leaves out the links' sensitivity results, which
  // are stale for the new proposal.
  const createProposal = async () => {
    notifyWarning(t('addProposal.warning'));
    const original = getValues();

    // The person doing the cloning always becomes the sole PI of the new proposal — not the
    // original proposal's full investigator list. Rather than guessing their identity
    // client-side, send no investigators at all: POST /create already builds a PI record from
    // the caller's verified auth token and appends it server-side (see
    // ska_oso_services/pht/api/prsls.py's create_proposal), so the proposal it returns, which
    // createInOda puts in the form, is the authoritative source for who that investigator is.
    const { data: cloned, error } = await createInOda({
      ...original,
      prslId: mintSkuid(Entity.PRP),
      title: original.title + ' ' + t('cloneProposal.suffix'),
      cycle: osdCycleId ?? '',
      investigators: []
    });

    if (!cloned) {
      notifyError(error ?? UNKNOWN_API_ERROR);
      return;
    }
    notifySuccess(t('addProposal.success') + cloned.prslId);
    updateAppContent1(validateProposal(cloned));
    // Create a new access entry for the PI.  Saves doing the endpoint
    const newAcc: Partial<ProposalAccess> = {
      prslId: cloned.prslId,
      role: PROPOSAL_ROLE_PI,
      permissions: PROPOSAL_ACCESS_PERMISSIONS
    };

    const acc = Array.isArray(application.content4)
      ? (application.content4 as ProposalAccess[])
      : [];

    updateAppContent4([...acc, newAcc]);

    window.scrollTo(0, 0);
    goToTitlePage();
  };

  const cloneConfirmed = () => {
    setOpenCloneDialog(false);
    createProposal();
  };

  const searchableFields: (keyof Proposal)[] = ['id', 'title', 'cycle', 'investigators'];

  function filterProposals() {
    return proposals.filter(
      (item) =>
        searchableFields.some((field) =>
          String(item[field])
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || '')
        ) &&
        (searchType === '' || item.status?.toLowerCase() === searchType?.toLowerCase())
    );
  }

  const filteredData = proposals ? filterProposals() : [];

  /*--------------------------------------------------------------------*/

  const addSubmissionButton = () => (
    <AddButton
      action={() => {
        setOpenCycleDialog(true);
      }}
      testId={'addSubmissionButton'}
      title="addProposal.label"
      toolTip="addProposal.toolTip"
    />
  );

  const cycleConfirmed = (policy: ObservatoryPolicy) => {
    reset({
      ...getProposalFormDefaults(),
      prslId: mintSkuid(Entity.PRP),
      cycle: policy.cycleInformation.cycleId,
      proposalType: {
        type: isSVPolicy(policy) ? PROPOSAL_TYPE.SCIENCE_VERIFICATION : null,
        subTypes: []
      }
    });
    updateAppContent1(EMPTY_STATUS);
    navigate(PATH[1]);
  };

  const cycleClicked = () => (
    <CycleSelection
      open={openCycleDialog}
      onClose={() => setOpenCycleDialog(false)}
      onConfirm={cycleConfirmed}
    />
  );

  /*--------------------------------------------------------------------*/

  const displayField = () => {
    return !!loggedIn;
  };

  const pageDescription = () => (
    <Typography
      align="center"
      variant="h6"
      sx={{
        minHeight: '5vh'
      }}
    >
      {t('page.' + PAGE_LANDING + '.desc')}
    </Typography>
  );

  const searchDropdown = () => (
    <DropDown
      options={[{ label: t('status.0'), value: '' }, ...PROPOSAL_STATUS_OPTIONS]}
      testId="proposalType"
      value={searchType}
      setValue={setSearchType}
      label={t('status.0')}
    />
  );

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  const cloneClicked = () => (
    <ProposalDisplay
      proposal={proposal}
      open={openCloneDialog}
      onClose={() => setOpenCloneDialog(false)}
      onConfirm={cloneConfirmed}
      onConfirmLabel="cloneProposal.confirm"
    />
  );

  const viewClicked = () => (
    <ProposalDisplay
      proposal={proposal}
      open={openViewDialog}
      onClose={() => setOpenViewDialog(false)}
    />
  );

  return (
    <>
      <Grid
        container
        direction="row"
        sx={{
          p: 5,
          alignItems: 'center',
          justifyContent: 'space-around'
        }}
      >
        <Grid size={{ xs: 12 }}>{loggedIn && pageDescription()}</Grid>
        <Grid
          size={{ sm: 4, md: 3, lg: 2 }}
          sx={{
            p: 2
          }}
        >
          {loggedIn ? addSubmissionButton() : null}
        </Grid>
        <Grid
          size={{ sm: 4 }}
          sx={{
            p: 2
          }}
        >
          {displayField() && searchDropdown()}
        </Grid>
        <Grid
          size={{ sm: 4, md: 6, lg: 6 }}
          sx={{
            p: 2,
            mt: -1
          }}
        >
          {displayField() && searchEntryField('searchId')}
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{
            pt: 1
          }}
        >
          {/* TODO(BTN-3258): remove "under test" notice before go-live */}
          {!axiosViewError && (
            <Alert
              color={AlertColorTypes.Warning}
              text={t('proposals.underTest')}
              testId="underTestPanelId"
            />
          )}
          {!axiosViewError && loggedIn && (!filteredData || filteredData.length === 0) && (
            <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
          )}
          {filteredData.length > 0 && (
            <Box
              sx={{
                pt: 5
              }}
            >
              <TableSubmissions
                data={filteredData}
                editFunction={editIconClicked}
                viewFunction={viewIconClicked}
                cloneFunction={cloneIconClicked}
              />
            </Box>
          )}
        </Grid>
        {!loggedIn && (
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              pt: 5
            }}
          >
            <Stack spacing={4}>
              <BorderedSection
                title={t('landingWelcome.label')}
                borderColor={theme.palette.info.main}
              >
                <Stack
                  spacing={5}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4
                  }}
                >
                  <Typography
                    align="center"
                    variant="h6"
                    sx={{
                      minHeight: '5vh',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {t('landingWelcome.description')}
                  </Typography>
                  <Box sx={{ minWidth: 300, '& button': { width: '100%' } }}>
                    <ButtonLogin
                      label={t('landingWelcome.button')}
                      toolTip={t('landingWelcome.tooltip')}
                      colorBG={theme.palette.secondary.main}
                      colorFG={theme.palette.secondary.contrastText}
                      testId="landingWelcomeLoginButton"
                    />
                  </Box>
                </Stack>
              </BorderedSection>
              <BorderedSection title={t('sensCalc.label')} borderColor={theme.palette.grey[600]}>
                <Stack
                  spacing={3}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4
                  }}
                >
                  <Typography
                    align="center"
                    variant="h6"
                    sx={{
                      minHeight: '5vh',
                      color: theme.palette.grey[600]
                    }}
                  >
                    {t('sensCalc.description')}
                  </Typography>
                  <Box sx={{ '& .MuiButton-root': { textTransform: 'none', fontSize: '18px' } }}>
                    <SensCalcButton link={t('sensCalc.url')} primary />
                  </Box>
                </Stack>
              </BorderedSection>
            </Stack>
          </Grid>
        )}
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
      {openCycleDialog && cycleClicked()}
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0
        }}
        elevation={0}
      >
        <Grid
          container
          sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}
        >
          <Grid>
            {axiosViewError && (
              <Alert
                color={AlertColorTypes.Error}
                testId="axiosViewErrorTestId"
                text={axiosViewError}
              />
            )}
            {axiosError && (
              <Alert color={AlertColorTypes.Error} testId="axiosErrorTestId" text={axiosError} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
